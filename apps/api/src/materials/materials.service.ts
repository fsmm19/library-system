import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MaterialFactory } from './factories/material.factory';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { SearchMaterialsDto } from './dto/search-materials.dto';

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
      authorName,
      yearFrom,
      yearTo,
      sortBy = 'relevance',
      page = 1,
      pageSize = 12,
    } = searchDto;

    const where: any = {};

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
      where.type = { in: types };
    }

    // Language filter
    if (languages && languages.length > 0) {
      where.language = { in: languages };
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
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Count total
    const total = await this.prisma.material.count({ where });

    // Get paginated results
    const materials = await this.prisma.material.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        authors: true,
        book: true,
      },
    });

    return {
      materials,
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
        authors: true,
        book: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto) {
    // Verify material exists
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Update material basic info
      const material = await tx.material.update({
        where: { id },
        data: {
          title: updateMaterialDto.title,
          subtitle: updateMaterialDto.subtitle,
          type: updateMaterialDto.type,
          language: updateMaterialDto.language,
        },
        include: {
          authors: true,
          book: true,
        },
      });

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
      if (updateMaterialDto.book && material.type === 'book') {
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
          book: true,
        },
      });
    });
  }

  async remove(id: string) {
    // Verify material exists
    await this.findOne(id);

    return this.prisma.material.delete({
      where: { id },
      include: {
        authors: true,
        book: true,
      },
    });
  }
}
