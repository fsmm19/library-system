import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { MaterialType } from 'generated/prisma/enums';

@Injectable()
export class MaterialFactory {
  constructor(private readonly prisma: PrismaService) {}

  async createMaterial(data: CreateMaterialDto) {
    return this.prisma.$transaction(async (tx) => {
      // Find or create authors
      const authorIds = await Promise.all(
        data.authors.map((authorDto) => this.findOrCreateAuthor(tx, authorDto)),
      );

      // Find or create categories
      const categoryIds = data.categories
        ? await Promise.all(
            data.categories.map((categoryDto) =>
              this.findOrCreateCategory(tx, categoryDto),
            ),
          )
        : [];

      // Create material
      const material = await tx.material.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          type: data.type,
          language: data.language,
          publishedDate: data.publishedDate
            ? new Date(data.publishedDate)
            : null,
          authors: {
            connect: authorIds.map((id) => ({ id })),
          },
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
        include: {
          authors: true,
          categories: true,
        },
      });

      // Create book if provided
      if (data.book && data.type === MaterialType.BOOK) {
        // Check if ISBN already exists
        if (data.book.isbn13) {
          const existingBook = await tx.book.findUnique({
            where: { isbn13: data.book.isbn13 },
            include: {
              material: true,
            },
          });

          if (existingBook) {
            throw new ConflictException(
              `Ya existe un libro con el ISBN13 ${data.book.isbn13}: "${existingBook.material.title}"`,
            );
          }
        }

        const book = await tx.book.create({
          data: {
            materialId: material.id,
            isbn13: data.book.isbn13,
            edition: data.book.edition,
            numberOfPages: data.book.numberOfPages,
            publisherId: data.book.publisherId,
          },
        });

        return { ...material, book };
      }

      return { ...material, book: null };
    });
  }

  private async findOrCreateCategory(
    tx: any,
    categoryDto: CreateCategoryDto,
  ): Promise<string> {
    // If ID is provided, use existing category
    if (categoryDto.id) {
      const category = await tx.category.findUnique({
        where: { id: categoryDto.id },
      });

      if (!category) {
        throw new Error(`Category with ID ${categoryDto.id} not found`);
      }

      return categoryDto.id;
    }

    // Try to find existing category by name
    const existingCategory = await tx.category.findFirst({
      where: {
        name: categoryDto.name,
      },
    });

    if (existingCategory) {
      return existingCategory.id;
    }

    // Create new category
    const newCategory = await tx.category.create({
      data: {
        name: categoryDto.name,
      },
    });

    return newCategory.id;
  }

  private async findOrCreateAuthor(
    tx: any,
    authorDto: CreateAuthorDto,
  ): Promise<string> {
    // If ID is provided, use existing author
    if (authorDto.id) {
      // Verify author exists
      const author = await tx.author.findUnique({
        where: { id: authorDto.id },
      });

      if (!author) {
        throw new Error(`Author with ID ${authorDto.id} not found`);
      }

      return authorDto.id;
    }

    // Try to find existing author by name
    const existingAuthor = await tx.author.findFirst({
      where: {
        firstName: authorDto.firstName,
        middleName: authorDto.middleName || null,
        lastName: authorDto.lastName,
        countryOfOriginId: authorDto.countryOfOriginId || null,
      },
    });

    if (existingAuthor) {
      return existingAuthor.id;
    }

    // Create new author
    const newAuthor = await tx.author.create({
      data: {
        firstName: authorDto.firstName,
        middleName: authorDto.middleName,
        lastName: authorDto.lastName,
        countryOfOriginId: authorDto.countryOfOriginId,
        birthDate: authorDto.birthDate ? new Date(authorDto.birthDate) : null,
      },
    });

    return newAuthor.id;
  }
}
