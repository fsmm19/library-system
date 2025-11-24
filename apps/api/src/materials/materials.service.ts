import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MaterialFactory } from './factories/material.factory';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { SearchMaterialsDto } from './dto/search-materials.dto';
import { MaterialType } from 'generated/prisma/enums';

@Injectable()
export class MaterialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly materialFactory: MaterialFactory,
  ) {}

  async create(createMaterialDto: CreateMaterialDto) {
    return this.materialFactory.createMaterial(createMaterialDto);
  }

  async findAll(searchDto: SearchMaterialsDto) {
    const {
      query,
      types,
      languages,
      categories,
      authorName,
      yearFrom,
      yearTo,
      sortBy = 'relevance',
      page = 1,
      pageSize = 12,
    } = searchDto;

    const where: any = {
      deletedAt: null, // Exclude soft-deleted materials
    };

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { subtitle: { contains: query, mode: 'insensitive' } },
        {
          authors: {
            some: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          book: {
            isbn13: { contains: query },
          },
        },
      ];
    }

    // Type filter
    if (types && types.length > 0) {
      // Convert to uppercase to match MaterialType enum
      const normalizedTypes = types.map((type) => type.toUpperCase());
      where.type = { in: normalizedTypes };
    }

    // Language filter
    if (languages && languages.length > 0) {
      where.language = { in: languages };
    }

    // Categories filter
    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          id: { in: categories },
        },
      };
    }

    // Author name filter
    if (authorName) {
      where.authors = {
        some: {
          OR: [
            { firstName: { contains: authorName, mode: 'insensitive' } },
            { lastName: { contains: authorName, mode: 'insensitive' } },
          ],
        },
      };
    }

    // Year range filter
    if (yearFrom || yearTo) {
      where.createdAt = {};
      if (yearFrom) {
        where.createdAt.gte = new Date(`${yearFrom}-01-01`);
      }
      if (yearTo) {
        where.createdAt.lte = new Date(`${yearTo}-12-31`);
      }
    }

    // Sorting
    let orderBy: any = {};
    let useCustomRelevanceSort = false;

    switch (sortBy) {
      case 'title-asc':
        orderBy = { title: 'asc' };
        break;
      case 'title-desc':
        orderBy = { title: 'desc' };
        break;
      case 'year-asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'year-desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'author':
        // This is more complex in Prisma, will default to relevance
        orderBy = { title: 'asc' };
        break;
      case 'relevance':
      default:
        // For relevance, we'll use custom sorting
        useCustomRelevanceSort = true;
        orderBy = { createdAt: 'desc' };
    }

    // Count total
    const total = await this.prisma.material.count({ where });

    // Get materials
    let materials;
    if (useCustomRelevanceSort) {
      // For relevance sorting, fetch all results to sort by availability
      materials = await this.prisma.material.findMany({
        where,
        orderBy,
        include: {
          authors: true,
          categories: true,
          book: true,
          copies: {
            where: {
              status: {
                not: 'REMOVED',
              },
            },
            select: {
              status: true,
            },
          },
        },
      });
    } else {
      // For other sorts, use regular pagination
      materials = await this.prisma.material.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          authors: true,
          categories: true,
          book: true,
          copies: {
            where: {
              status: {
                not: 'REMOVED',
              },
            },
            select: {
              status: true,
            },
          },
        },
      });
    }

    // Add copy statistics to each material
    const materialsWithCopyStats = materials.map((material) => {
      const totalCopies = material.copies.length;
      const availableCopies = material.copies.filter(
        (copy) => copy.status === 'AVAILABLE',
      ).length;

      const { copies, ...materialWithoutCopies } = material;

      return {
        ...materialWithoutCopies,
        totalCopies,
        availableCopies,
      };
    });

    // Apply custom relevance sorting if needed
    let finalMaterials = materialsWithCopyStats;
    if (useCustomRelevanceSort) {
      // Sort by availability priority, then by date
      finalMaterials = materialsWithCopyStats.sort((a, b) => {
        // First, categorize by availability
        const getAvailabilityPriority = (material: any) => {
          if (material.availableCopies > 0) return 1; // Has available copies
          if (material.totalCopies > 0) return 2; // Has copies but not available
          return 3; // No copies
        };

        const priorityA = getAvailabilityPriority(a);
        const priorityB = getAvailabilityPriority(b);

        // If same priority, sort by date (most recent first)
        if (priorityA === priorityB) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        // Otherwise sort by priority
        return priorityA - priorityB;
      });

      // Apply pagination after custom sorting
      finalMaterials = finalMaterials.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );
    }

    return {
      materials: finalMaterials,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            countryOfOrigin: true,
          },
        },
        categories: true,
        book: {
          include: {
            publisher: true,
          },
        },
        copies: {
          where: {
            status: {
              not: 'REMOVED',
            },
          },
          orderBy: {
            acquisitionDate: 'desc',
          },
        },
      },
    });

    if (!material || material.deletedAt) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    // Add copy statistics
    const totalCopies = material.copies.length;
    const availableCopies = material.copies.filter(
      (copy) => copy.status === 'AVAILABLE',
    ).length;

    // Count total loans for this material (across all copies)
    const totalLoans = await this.prisma.loan.count({
      where: {
        copy: {
          materialId: id,
        },
      },
    });

    return {
      ...material,
      totalCopies,
      availableCopies,
      totalLoans,
    };
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto) {
    // Verify material exists
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {
        title: updateMaterialDto.title,
        subtitle: updateMaterialDto.subtitle,
        type: updateMaterialDto.type,
        language: updateMaterialDto.language,
      };

      // Only include publishedDate if it has a valid value (not empty string)
      if (
        updateMaterialDto.publishedDate &&
        typeof updateMaterialDto.publishedDate === 'string' &&
        updateMaterialDto.publishedDate.trim() !== ''
      ) {
        // Convert to ISO DateTime if it's just a date (YYYY-MM-DD)
        const dateValue = updateMaterialDto.publishedDate.includes('T')
          ? updateMaterialDto.publishedDate
          : `${updateMaterialDto.publishedDate}T00:00:00.000Z`;
        updateData.publishedDate = new Date(dateValue);
      } else if (
        updateMaterialDto.publishedDate === '' ||
        updateMaterialDto.publishedDate === null
      ) {
        // Explicitly set to null if empty string is sent
        updateData.publishedDate = null;
      }

      // Only include description if provided
      if (updateMaterialDto.description !== undefined) {
        updateData.description = updateMaterialDto.description;
      }

      // Update material basic info
      const material = await tx.material.update({
        where: { id },
        data: updateData,
        include: {
          authors: true,
          categories: true,
          book: true,
        },
      });

      // Update categories if provided
      if (updateMaterialDto.categories !== undefined) {
        // Disconnect all current categories
        await tx.material.update({
          where: { id },
          data: {
            categories: {
              set: [],
            },
          },
        });

        // Connect new categories if any
        if (
          updateMaterialDto.categories &&
          updateMaterialDto.categories.length > 0
        ) {
          await tx.material.update({
            where: { id },
            data: {
              categories: {
                connect: updateMaterialDto.categories.map((cat) => ({
                  id: cat.id,
                })),
              },
            },
          });
        }
      }

      // Update authors if provided
      if (updateMaterialDto.authors) {
        // Disconnect all current authors
        await tx.material.update({
          where: { id },
          data: {
            authors: {
              set: [],
            },
          },
        });

        // Find or create new authors
        const authorIds = await Promise.all(
          updateMaterialDto.authors.map((authorDto) =>
            this.materialFactory['findOrCreateAuthor'](tx, authorDto),
          ),
        );

        // Connect new authors
        await tx.material.update({
          where: { id },
          data: {
            authors: {
              connect: authorIds.map((authorId) => ({ id: authorId })),
            },
          },
        });
      }

      // Update book if provided
      if (updateMaterialDto.book && material.type === MaterialType.BOOK) {
        const existingBook = await tx.book.findUnique({
          where: { materialId: id },
        });

        if (existingBook) {
          await tx.book.update({
            where: { materialId: id },
            data: updateMaterialDto.book,
          });
        } else {
          await tx.book.create({
            data: {
              materialId: id,
              ...updateMaterialDto.book,
            },
          });
        }
      }

      // Fetch updated material
      return tx.material.findUnique({
        where: { id },
        include: {
          authors: true,
          categories: true,
          book: true,
        },
      });
    });
  }

  async remove(id: string) {
    // Verify material exists
    await this.findOne(id);

    // Check if material has any copies
    const copiesCount = await this.prisma.materialCopy.count({
      where: {
        materialId: id,
        status: {
          not: 'REMOVED', // Exclude removed copies
        },
      },
    });

    if (copiesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el material porque tiene ${copiesCount} copia${copiesCount > 1 ? 's' : ''} física${copiesCount > 1 ? 's' : ''} asociada${copiesCount > 1 ? 's' : ''}`,
      );
    }

    // Soft delete: set deletedAt timestamp instead of hard delete
    return this.prisma.material.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      include: {
        authors: true,
        categories: true,
        book: true,
      },
    });
  }

  async findAllAuthors() {
    return this.prisma.author.findMany({
      include: {
        countryOfOrigin: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAllCountries() {
    return this.prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAllPublishers() {
    return this.prisma.publisher.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Categories CRUD
  async createCategory(data: { name: string }) {
    return this.prisma.category.create({
      data: { name: data.name },
    });
  }

  async updateCategory(id: string, data: { name?: string }) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async removeCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        materials: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.materials.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría porque tiene ${category.materials.length} material(es) asociado(s)`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Countries CRUD
  async createCountry(data: { name: string }) {
    return this.prisma.country.create({
      data: { name: data.name },
    });
  }

  async updateCountry(id: string, data: { name?: string }) {
    const country = await this.prisma.country.findUnique({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return this.prisma.country.update({
      where: { id },
      data,
    });
  }

  async removeCountry(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      include: {
        authors: true,
      },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    if (country.authors.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el país porque tiene ${country.authors.length} autor(es) asociado(s)`,
      );
    }

    return this.prisma.country.delete({
      where: { id },
    });
  }

  // Publishers CRUD
  async createPublisher(data: { name: string }) {
    return this.prisma.publisher.create({
      data: { name: data.name },
    });
  }

  async updatePublisher(id: string, data: { name?: string }) {
    const publisher = await this.prisma.publisher.findUnique({
      where: { id },
    });

    if (!publisher) {
      throw new NotFoundException(`Publisher with ID ${id} not found`);
    }

    return this.prisma.publisher.update({
      where: { id },
      data,
    });
  }

  async removePublisher(id: string) {
    const publisher = await this.prisma.publisher.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!publisher) {
      throw new NotFoundException(`Publisher with ID ${id} not found`);
    }

    if (publisher.books.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la editorial porque tiene ${publisher.books.length} libro(s) asociado(s)`,
      );
    }

    return this.prisma.publisher.delete({
      where: { id },
    });
  }

  // Authors CRUD
  async updateAuthor(
    id: string,
    data: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      countryOfOriginId?: string;
      birthDate?: string;
    },
  ) {
    const author = await this.prisma.author.findUnique({
      where: { id },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return this.prisma.author.update({
      where: { id },
      include: {
        countryOfOrigin: true,
      },
      data,
    });
  }

  async removeAuthor(id: string) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        materials: true,
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    if (author.materials.length > 0) {
      throw new ConflictException(
        `El autor tiene ${author.materials.length} ${author.materials.length === 1 ? 'material asociado' : 'materiales asociados'}`,
      );
    }

    return this.prisma.author.delete({
      where: { id },
    });
  }
}
