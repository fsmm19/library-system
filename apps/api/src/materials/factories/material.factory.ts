import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { MaterialType } from 'generated/prisma/enums';

@Injectable()
export class MaterialFactory {
  constructor(private readonly prisma: PrismaService) {}

  async createMaterial(data: CreateMaterialDto) {
    return this.prisma.$transaction(async (tx) => {
      // Find or create authors
      const authorIds = await Promise.all(
        data.authors.map((authorDto) => this.findOrCreateAuthor(tx, authorDto))
      );

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
        },
        include: {
          authors: true,
        },
      });

      // Create book if provided
      if (data.book && data.type === MaterialType.BOOK) {
        const book = await tx.book.create({
          data: {
            materialId: material.id,
            isbn13: data.book.isbn13,
            edition: data.book.edition,
            numberOfPages: data.book.numberOfPages,
          },
        });

        return { ...material, book };
      }

      return { ...material, book: null };
    });
  }

  private async findOrCreateAuthor(
    tx: any,
    authorDto: CreateAuthorDto
  ): Promise<string> {
    // Try to find existing author
    const existingAuthor = await tx.author.findFirst({
      where: {
        firstName: authorDto.firstName,
        middleName: authorDto.middleName || null,
        lastName: authorDto.lastName,
        nationality: authorDto.nationality || null,
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
        nationality: authorDto.nationality,
        birthDate: authorDto.birthDate ? new Date(authorDto.birthDate) : null,
      },
    });

    return newAuthor.id;
  }
}
