import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MaterialCopyFactory } from './factories/material-copy.factory';
import { CreateMaterialCopyDto } from './dto/create-material-copy.dto';
import { UpdateMaterialCopyDto } from './dto/update-material-copy.dto';
import { BadRequestException } from '@nestjs/common';
import { MaterialCopyCondition } from 'generated/prisma/enums';

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
        loans: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            loanDate: 'desc',
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
    const existingCopy = await this.findOne(id);

    // If trying to mark as LOST, check for active loans
    if (
      updateMaterialCopyDto.condition === MaterialCopyCondition.LOST &&
      existingCopy.condition !== MaterialCopyCondition.LOST
    ) {
      const activeLoans = await this.prisma.loan.count({
        where: {
          copyId: id,
          status: {
            in: ['ACTIVE', 'OVERDUE'],
          },
        },
      });

      if (activeLoans > 0) {
        throw new BadRequestException(
          'No se puede marcar como perdido una copia con préstamos activos. Por favor, gestione primero el préstamo activo.',
        );
      }
    }

    return this.prisma.materialCopy.update({
      where: { id },
      data: {
        acquisitionDate: updateMaterialCopyDto.acquisitionDate
          ? new Date(updateMaterialCopyDto.acquisitionDate)
          : undefined,
        condition: updateMaterialCopyDto.condition,
        status: updateMaterialCopyDto.status,
        location: updateMaterialCopyDto.location,
        barcode: updateMaterialCopyDto.barcode,
        catalogCode: updateMaterialCopyDto.catalogCode,
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

    // Check if copy has any loans (to preserve historical data)
    const loansCount = await this.prisma.loan.count({
      where: {
        copyId: id,
      },
    });

    // Check if copy has any reservations
    const reservationsCount = await this.prisma.reservation.count({
      where: {
        copyId: id,
      },
    });

    if (loansCount > 0 && reservationsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar una copia con préstamos y reservaciones asociadas',
      );
    }

    if (loansCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar una copia con préstamos asociados',
      );
    }

    if (reservationsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar una copia con reservaciones asociadas',
      );
    }

    // Hard delete
    return this.prisma.materialCopy.delete({
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
  }

  async getAvailableCount(materialId: string): Promise<number> {
    return this.prisma.materialCopy.count({
      where: {
        materialId,
        status: 'AVAILABLE',
      },
    });
  }

  async getTotalCount(materialId: string): Promise<number> {
    return this.prisma.materialCopy.count({
      where: {
        materialId,
        status: {
          not: 'REMOVED',
        },
      },
    });
  }
}
