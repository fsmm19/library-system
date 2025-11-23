import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import {
  ReservationStatus,
  MaterialCopyStatus,
  Role,
} from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    const { materialId, memberId, notes } = createReservationDto;

    // Verify material exists
    const material = await this.prisma.material.findUnique({
      where: { id: materialId, deletedAt: null },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Verify member exists
    const member = await this.prisma.member.findUnique({
      where: { userId: memberId },
      include: {
        user: true,
      },
    });

    if (!member || member.user.deletedAt) {
      throw new NotFoundException('Member not found');
    }

    // Check if member already has an active reservation for this material
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        memberId,
        materialId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.READY],
        },
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        'Ya tienes una reserva activa para este material',
      );
    }

    // Check if there are available copies
    const availableCopy = await this.prisma.materialCopy.findFirst({
      where: {
        materialId,
        status: MaterialCopyStatus.AVAILABLE,
        deletedAt: null,
      },
    });

    // Count pending reservations for this material
    const pendingReservationsCount = await this.prisma.reservation.count({
      where: {
        materialId,
        status: ReservationStatus.PENDING,
      },
    });

    // Create reservation
    const reservation = await this.prisma.reservation.create({
      data: {
        memberId,
        materialId,
        notes,
        status: availableCopy
          ? ReservationStatus.READY
          : ReservationStatus.PENDING,
        queuePosition: availableCopy ? null : pendingReservationsCount + 1,
        copyId: availableCopy?.id,
        expirationDate: availableCopy
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null, // 7 days to pick up
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        copy: true,
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
    });

    // If a copy is ready, mark it as reserved
    if (availableCopy) {
      await this.prisma.materialCopy.update({
        where: { id: availableCopy.id },
        data: { status: MaterialCopyStatus.RESERVED },
      });
    }

    return this.formatReservation(reservation);
  }

  async findAll(getReservationsDto: GetReservationsDto) {
    const {
      memberId,
      materialId,
      status,
      page = 1,
      pageSize = 10,
    } = getReservationsDto;

    const where: Prisma.ReservationWhereInput = {};

    if (memberId) where.memberId = memberId;
    if (materialId) where.materialId = materialId;
    if (status) where.status = status;

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ reservationDate: 'desc' }],
        include: {
          member: {
            include: {
              user: true,
            },
          },
          copy: true,
          material: {
            include: {
              authors: true,
              book: true,
            },
          },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      reservations: reservations.map((r) => this.formatReservation(r)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        copy: true,
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.formatReservation(reservation);
  }

  async updateStatus(
    id: string,
    updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        copy: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const { status, copyId, expirationDate, notes } =
      updateReservationStatusDto;

    // Validate status transitions
    if (
      reservation.status === ReservationStatus.PICKED_UP ||
      reservation.status === ReservationStatus.CANCELLED ||
      reservation.status === ReservationStatus.EXPIRED
    ) {
      throw new BadRequestException(
        'Cannot update a reservation that is already picked up, cancelled, or expired',
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (notes !== undefined) updateData.notes = notes;
    if (expirationDate) updateData.expirationDate = new Date(expirationDate);

    // Handle status-specific logic
    if (status === ReservationStatus.READY) {
      if (!copyId) {
        throw new BadRequestException(
          'Copy ID is required when marking reservation as ready',
        );
      }

      // Verify copy exists and is available
      const copy = await this.prisma.materialCopy.findUnique({
        where: { id: copyId },
      });

      if (!copy || copy.deletedAt) {
        throw new NotFoundException('Copy not found');
      }

      if (copy.status !== MaterialCopyStatus.AVAILABLE) {
        throw new BadRequestException('Copy is not available');
      }

      updateData.copyId = copyId;
      updateData.expirationDate =
        expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Mark copy as reserved
      await this.prisma.materialCopy.update({
        where: { id: copyId },
        data: { status: MaterialCopyStatus.RESERVED },
      });

      // Release previous copy if any
      if (reservation.copyId && reservation.copyId !== copyId) {
        await this.prisma.materialCopy.update({
          where: { id: reservation.copyId },
          data: { status: MaterialCopyStatus.AVAILABLE },
        });
      }
    } else if (status === ReservationStatus.PICKED_UP) {
      updateData.pickedUpAt = new Date();

      // Release the reserved copy (it should be borrowed through a loan)
      if (reservation.copyId) {
        await this.prisma.materialCopy.update({
          where: { id: reservation.copyId },
          data: { status: MaterialCopyStatus.BORROWED },
        });
      }
    } else if (status === ReservationStatus.CANCELLED) {
      updateData.cancelledAt = new Date();

      // Release the reserved copy
      if (reservation.copyId) {
        await this.prisma.materialCopy.update({
          where: { id: reservation.copyId },
          data: { status: MaterialCopyStatus.AVAILABLE },
        });
      }

      // Update queue positions for pending reservations
      await this.updateQueuePositions(reservation.materialId);
    } else if (status === ReservationStatus.EXPIRED) {
      // Release the reserved copy
      if (reservation.copyId) {
        await this.prisma.materialCopy.update({
          where: { id: reservation.copyId },
          data: { status: MaterialCopyStatus.AVAILABLE },
        });
      }

      // Update queue positions for pending reservations
      await this.updateQueuePositions(reservation.materialId);
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          include: {
            user: true,
          },
        },
        copy: true,
        material: {
          include: {
            authors: true,
            book: true,
          },
        },
      },
    });

    return this.formatReservation(updatedReservation);
  }

  async cancelReservation(id: string, memberId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.memberId !== memberId) {
      throw new BadRequestException(
        'You can only cancel your own reservations',
      );
    }

    if (
      reservation.status === ReservationStatus.PICKED_UP ||
      reservation.status === ReservationStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot cancel a reservation that is already picked up or cancelled',
      );
    }

    return this.updateStatus(id, {
      status: ReservationStatus.CANCELLED,
    });
  }

  async getMemberStats(memberId: string) {
    const [
      activeReservations,
      readyForPickup,
      confirmedPickup,
      totalReservations,
    ] = await Promise.all([
      this.prisma.reservation.count({
        where: {
          memberId,
          status: {
            in: [ReservationStatus.PENDING, ReservationStatus.READY],
          },
        },
      }),
      this.prisma.reservation.count({
        where: {
          memberId,
          status: ReservationStatus.READY,
        },
      }),
      this.prisma.reservation.count({
        where: {
          memberId,
          status: ReservationStatus.READY,
          confirmedAt: {
            not: null,
          },
        },
      }),
      this.prisma.reservation.count({
        where: { memberId },
      }),
    ]);

    return {
      activeReservations,
      readyForPickup,
      confirmedPickup,
      totalReservations,
    };
  }

  async updateExpiredReservations() {
    const expiredReservations = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.READY,
        expirationDate: {
          lt: new Date(),
        },
      },
    });

    const updatedIds: string[] = [];

    for (const reservation of expiredReservations) {
      await this.updateStatus(reservation.id, {
        status: ReservationStatus.EXPIRED,
      });
      updatedIds.push(reservation.id);
    }

    return {
      updated: updatedIds.length,
      reservationIds: updatedIds,
    };
  }

  private async updateQueuePositions(materialId: string) {
    const pendingReservations = await this.prisma.reservation.findMany({
      where: {
        materialId,
        status: ReservationStatus.PENDING,
      },
      orderBy: { reservationDate: 'asc' },
    });

    for (let i = 0; i < pendingReservations.length; i++) {
      await this.prisma.reservation.update({
        where: { id: pendingReservations[i].id },
        data: { queuePosition: i + 1 },
      });
    }

    // Check if there's an available copy to assign to the first in queue
    const availableCopy = await this.prisma.materialCopy.findFirst({
      where: {
        materialId,
        status: MaterialCopyStatus.AVAILABLE,
        deletedAt: null,
      },
    });

    if (availableCopy && pendingReservations.length > 0) {
      await this.updateStatus(pendingReservations[0].id, {
        status: ReservationStatus.READY,
        copyId: availableCopy.id,
      });
    }
  }

  async confirmPickup(reservationId: string, memberId: string) {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        member: true,
        material: true,
        copy: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Verify the reservation belongs to the member
    if (reservation.memberId !== memberId) {
      throw new BadRequestException(
        'You can only confirm pickup for your own reservations',
      );
    }

    // Verify the reservation is in READY status
    if (reservation.status !== ReservationStatus.READY) {
      throw new BadRequestException(
        'Only reservations in READY status can be confirmed for pickup',
      );
    }

    // Check if already confirmed
    if (reservation.confirmedAt) {
      throw new BadRequestException('Pickup has already been confirmed');
    }

    // Update confirmedAt without changing status
    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        confirmedAt: new Date(),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        material: {
          include: {
            authors: true,
          },
        },
        copy: true,
      },
    });

    return {
      data: this.formatReservation(updatedReservation),
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  private formatReservation(reservation: any) {
    return {
      ...reservation,
      reservationDate: reservation.reservationDate.toISOString(),
      expirationDate: reservation.expirationDate?.toISOString() || null,
      confirmedAt: reservation.confirmedAt?.toISOString() || null,
      pickedUpAt: reservation.pickedUpAt?.toISOString() || null,
      cancelledAt: reservation.cancelledAt?.toISOString() || null,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      member: reservation.member
        ? {
            ...reservation.member,
            user: {
              ...reservation.member.user,
              createdAt: reservation.member.user.createdAt.toISOString(),
              updatedAt: reservation.member.user.updatedAt.toISOString(),
              deletedAt:
                reservation.member.user.deletedAt?.toISOString() || null,
            },
          }
        : null,
      material: reservation.material
        ? {
            ...reservation.material,
            publishedDate:
              reservation.material.publishedDate?.toISOString() || null,
            createdAt: reservation.material.createdAt.toISOString(),
            updatedAt: reservation.material.updatedAt.toISOString(),
            deletedAt: reservation.material.deletedAt?.toISOString() || null,
            authors: reservation.material.authors?.map((author: any) => ({
              ...author,
              birthDate: author.birthDate?.toISOString() || null,
            })),
          }
        : null,
      copy: reservation.copy
        ? {
            ...reservation.copy,
            acquisitionDate: reservation.copy.acquisitionDate.toISOString(),
            createdAt: reservation.copy.createdAt.toISOString(),
            updatedAt: reservation.copy.updatedAt.toISOString(),
            deletedAt: reservation.copy.deletedAt?.toISOString() || null,
          }
        : null,
    };
  }
}
