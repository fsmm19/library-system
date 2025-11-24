import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialCopyDto } from '../dto/create-material-copy.dto';
import { MaterialType } from 'generated/prisma/enums';

@Injectable()
export class MaterialCopyFactory {
  constructor(private readonly prisma: PrismaService) {}

  private getTypePrefix(type: MaterialType): string {
    const prefixes: Record<MaterialType, string> = {
      BOOK: 'LIB',
      MAGAZINE: 'REV',
      DVD: 'DVD',
      OTHER: 'OTR',
    };
    return prefixes[type];
  }

  private async generateCatalogCode(
    materialType: MaterialType,
  ): Promise<string> {
    const prefix = this.getTypePrefix(materialType);

    // Get the last catalog code with this prefix
    const lastCopy = await this.prisma.materialCopy.findFirst({
      where: {
        catalogCode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        catalogCode: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastCopy && lastCopy.catalogCode) {
      const lastNumber = parseInt(lastCopy.catalogCode.split('-')[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
  }

  async createMaterialCopy(data: CreateMaterialCopyDto) {
    // Verify that the material exists
    const material = await this.prisma.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) {
      throw new NotFoundException(
        `Material with ID ${data.materialId} not found`,
      );
    }

    // Generate catalog code
    const catalogCode = await this.generateCatalogCode(material.type);

    // Create the material copy
    return this.prisma.materialCopy.create({
      data: {
        materialId: data.materialId,
        acquisitionDate: new Date(data.acquisitionDate),
        condition: data.condition,
        status: data.status,
        location: data.location || undefined,
        barcode: data.barcode || undefined,
        catalogCode: catalogCode,
      },
      include: {
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
    });
  }
}
