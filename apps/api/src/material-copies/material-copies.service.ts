import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MaterialCopyFactory } from './factories/material-copy.factory';
import { CreateMaterialCopyDto } from './dto/create-material-copy.dto';
import { UpdateMaterialCopyDto } from './dto/update-material-copy.dto';

@Injectable()
export class MaterialCopiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly materialCopyFactory: MaterialCopyFactory,
  ) {}

  async create(createMaterialCopyDto: CreateMaterialCopyDto) {
    return this.materialCopyFactory.createMaterialCopy(createMaterialCopyDto);
  }

  async findAll() {
    return this.prisma.materialCopy.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByMaterial(materialId: string) {
    return this.prisma.materialCopy.findMany({
      where: {
        materialId,
        deletedAt: null,
      },
      include: {
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
      orderBy: {
        acquisitionDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const copy = await this.prisma.materialCopy.findUnique({
      where: { id },
      include: {
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
    });

    if (!copy) {
      throw new NotFoundException(`Material copy with ID ${id} not found`);
    }

    return copy;
  }

  async update(id: string, updateMaterialCopyDto: UpdateMaterialCopyDto) {
    // Verify copy exists
    await this.findOne(id);

    return this.prisma.materialCopy.update({
      where: { id },
      data: {
        acquisitionDate: updateMaterialCopyDto.acquisitionDate
          ? new Date(updateMaterialCopyDto.acquisitionDate)
          : undefined,
        condition: updateMaterialCopyDto.condition,
        status: updateMaterialCopyDto.status,
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

  async remove(id: string) {
    // Verify copy exists
    await this.findOne(id);

    // Soft delete
    return this.prisma.materialCopy.update({
      where: { id },
      data: {
        deletedAt: new Date(),
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

  async getAvailableCount(materialId: string): Promise<number> {
    return this.prisma.materialCopy.count({
      where: {
        materialId,
        status: 'AVAILABLE',
        deletedAt: null,
      },
    });
  }

  async getTotalCount(materialId: string): Promise<number> {
    return this.prisma.materialCopy.count({
      where: {
        materialId,
        deletedAt: null,
      },
    });
  }
}
