import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialCopyDto } from '../dto/create-material-copy.dto';

@Injectable()
export class MaterialCopyFactory {
  constructor(private readonly prisma: PrismaService) {}

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

    // Create the material copy
    return this.prisma.materialCopy.create({
      data: {
        materialId: data.materialId,
        acquisitionDate: new Date(data.acquisitionDate),
        condition: data.condition,
        status: data.status,
        location: data.location,
        barcode: data.barcode,
        catalogCode: data.catalogCode,
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
