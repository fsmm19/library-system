import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { GetFinesDto } from './dto/get-fines.dto';
import { FineStatus, LoanStatus } from 'generated/prisma/enums';

@Injectable()
export class FinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFineDto: CreateFineDto, issuedById: string) {
    // Verify loan exists
    const loan = await this.prisma.loan.findUnique({
      where: { id: createFineDto.loanId },
    });

    if (!loan) {
      throw new NotFoundException(
        `Loan with ID ${createFineDto.loanId} not found`,
      );
    }

    return this.prisma.fine.create({
      data: {
        ...createFineDto,
        issuedById,
      },
      include: {
        loan: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
            copy: {
              include: {
                material: true,
              },
            },
          },
        },
        issuedBy: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(getFinesDto: GetFinesDto) {
    const { memberId, status, page = 1, pageSize = 20 } = getFinesDto;

    const where: any = {
      deletedAt: null,
    };

    if (memberId) {
      where.loan = {
        memberId,
      };
    }

    if (status) {
      where.status = status;
    }

    const total = await this.prisma.fine.count({ where });

    const fines = await this.prisma.fine.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        loan: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
            copy: {
              include: {
                material: true,
              },
            },
          },
        },
        issuedBy: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      fines,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const fine = await this.prisma.fine.findUnique({
      where: { id },
      include: {
        loan: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
            copy: {
              include: {
                material: true,
              },
            },
          },
        },
        issuedBy: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!fine) {
      throw new NotFoundException(`Fine with ID ${id} not found`);
    }

    return fine;
  }

  async update(id: string, updateFineDto: UpdateFineDto) {
    await this.findOne(id);

    const updateData: any = { ...updateFineDto };

    // If fully paid, mark as PAID
    if (updateFineDto.paidAmount !== undefined) {
      const fine = await this.prisma.fine.findUnique({ where: { id } });
      if (fine && updateFineDto.paidAmount >= fine.amount) {
        updateData.status = FineStatus.PAID;
        updateData.paidDate = updateFineDto.paidDate || new Date().toISOString();
      }
    }

    return this.prisma.fine.update({
      where: { id },
      data: updateData,
      include: {
        loan: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
            copy: {
              include: {
                material: true,
              },
            },
          },
        },
        issuedBy: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async calculateOverdueFine(
    dueDate: Date,
    returnDate: Date,
    dailyFineAmount: number,
    gracePeriodDays: number,
  ): Promise<number> {
    const dueDateObj = new Date(dueDate);
    const returnDateObj = new Date(returnDate);

    // Calculate days overdue
    const diffTime = returnDateObj.getTime() - dueDateObj.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Subtract grace period
    const billableDays = Math.max(0, daysOverdue - gracePeriodDays);

    return billableDays * dailyFineAmount;
  }

  async getMemberFineStats(memberId: string) {
    const fines = await this.prisma.fine.findMany({
      where: {
        loan: {
          memberId,
        },
        deletedAt: null,
      },
    });

    const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
    const unpaidFines = fines
      .filter((fine) => fine.status === FineStatus.PENDING)
      .reduce((sum, fine) => sum + (fine.amount - fine.paidAmount), 0);

    return {
      totalFines,
      unpaidFines,
      fineCount: fines.length,
    };
  }
}
