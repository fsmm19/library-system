import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { GetLoansDto } from './dto/get-loans.dto';
import { LoanConfigurationService } from './loan-configuration.service';
import { FinesService } from './fines.service';
import {
  LoanStatus,
  MaterialCopyStatus,
  AccountState,
  MaterialCopyCondition,
  ReservationStatus,
} from 'generated/prisma/enums';

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: LoanConfigurationService,
    private readonly finesService: FinesService,
  ) {}

  async create(createLoanDto: CreateLoanDto, processedById: string) {
    const config = await this.configService.getConfiguration();

    // Validate member exists and is active
    const member = await this.prisma.member.findUnique({
      where: { userId: createLoanDto.memberId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createLoanDto.memberId} not found`,
      );
    }

    if (member.accountState !== AccountState.ACTIVE) {
      throw new BadRequestException(
        `Member account is not active. Current state: ${member.accountState}`,
      );
    }

    // Validate copy exists and is available
    const copy = await this.prisma.materialCopy.findUnique({
      where: { id: createLoanDto.copyId },
      include: { material: true },
    });

    if (!copy) {
      throw new NotFoundException(
        `Material copy with ID ${createLoanDto.copyId} not found`,
      );
    }

    if (copy.status !== MaterialCopyStatus.AVAILABLE) {
      throw new BadRequestException(
        `Material copy is not available. Current status: ${copy.status}`,
      );
    }

    if (
      copy.condition === MaterialCopyCondition.DAMAGED ||
      copy.condition === MaterialCopyCondition.LOST
    ) {
      throw new BadRequestException(
        `Material copy is in ${copy.condition} condition and cannot be loaned`,
      );
    }

    // Check if member has reached max active loans
    const activeLoansCount = await this.prisma.loan.count({
      where: {
        memberId: createLoanDto.memberId,
        status: LoanStatus.ACTIVE,
        deletedAt: null,
      },
    });

    if (activeLoansCount >= config.maxActiveLoans) {
      throw new BadRequestException(
        `Member has reached the maximum number of active loans (${config.maxActiveLoans})`,
      );
    }

    // Check for overdue loans
    const overdueLoans = await this.prisma.loan.count({
      where: {
        memberId: createLoanDto.memberId,
        status: LoanStatus.OVERDUE,
        deletedAt: null,
      },
    });

    if (overdueLoans > 0) {
      throw new BadRequestException(
        `Member has ${overdueLoans} overdue loan(s). Please return them before borrowing new materials.`,
      );
    }

    // Check for unpaid fines
    if (!config.allowLoansWithFines) {
      const fineStats = await this.finesService.getMemberFineStats(
        createLoanDto.memberId,
      );
      if (fineStats.unpaidFines > 0) {
        throw new BadRequestException(
          `Member has unpaid fines totaling $${fineStats.unpaidFines.toFixed(2)}. Please pay fines before borrowing.`,
        );
      }
    }

    // Calculate loan dates
    const loanDate = createLoanDto.loanDate
      ? new Date(createLoanDto.loanDate)
      : new Date();

    // Use material-specific loan days if set, otherwise use default
    const loanDays = copy.material.maxLoanDays || config.defaultLoanDays;
    const dueDate = new Date(loanDate);
    dueDate.setDate(dueDate.getDate() + loanDays);

    // Create loan in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Update copy status to BORROWED
      await tx.materialCopy.update({
        where: { id: createLoanDto.copyId },
        data: { status: MaterialCopyStatus.BORROWED },
      });

      // Create the loan
      const loan = await tx.loan.create({
        data: {
          member: {
            connect: { userId: createLoanDto.memberId },
          },
          copy: {
            connect: { id: createLoanDto.copyId },
          },
          processedBy: {
            connect: { userId: processedById },
          },
          loanDate,
          dueDate,
          status: LoanStatus.ACTIVE,
          notes: createLoanDto.notes,
        },
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
          processedBy: {
            include: {
              user: true,
            },
          },
        },
      });

      return loan;
    });
  }

  async findAll(getLoansDto: GetLoansDto) {
    const { memberId, status, overdue, page = 1, pageSize = 20 } = getLoansDto;

    const where: any = {
      deletedAt: null,
    };

    if (memberId) {
      where.memberId = memberId;
    }

    if (status) {
      where.status = status;
    }

    if (overdue) {
      where.dueDate = {
        lt: new Date().toISOString(),
      };
      where.status = LoanStatus.ACTIVE;
    }

    const total = await this.prisma.loan.count({ where });

    const loans = await this.prisma.loan.findMany({
      where,
      orderBy: { loanDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
        processedBy: {
          include: {
            user: true,
          },
        },
        fines: true,
      },
    });

    return {
      loans,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
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
        processedBy: {
          include: {
            user: true,
          },
        },
        fines: true,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async returnLoan(id: string, returnDate?: string) {
    const loan = await this.findOne(id);

    if (
      loan.status !== LoanStatus.ACTIVE &&
      loan.status !== LoanStatus.OVERDUE
    ) {
      throw new BadRequestException(
        `Loan is not active. Current status: ${loan.status}`,
      );
    }

    const actualReturnDate = returnDate ? new Date(returnDate) : new Date();
    const config = await this.configService.getConfiguration();

    return this.prisma.$transaction(async (tx) => {
      // Update copy status to AVAILABLE
      await tx.materialCopy.update({
        where: { id: loan.copyId },
        data: { status: MaterialCopyStatus.AVAILABLE },
      });

      // Update loan status
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          returnDate: actualReturnDate,
          status: LoanStatus.RETURNED,
        },
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
          processedBy: {
            include: {
              user: true,
            },
          },
          fines: true,
        },
      });

      // Check if overdue and create fine if necessary
      const dueDate = new Date(loan.dueDate);
      if (actualReturnDate > dueDate) {
        const fineAmount = await this.finesService.calculateOverdueFine(
          dueDate,
          actualReturnDate,
          config.dailyFineAmount,
          config.gracePeriodDays,
        );

        if (fineAmount > 0) {
          await tx.fine.create({
            data: {
              loanId: id,
              amount: fineAmount,
              reason: 'Late return',
              issuedById: loan.processedById,
            },
          });
        }
      }

      // Check if there are pending reservations for this material
      const pendingReservation = await tx.reservation.findFirst({
        where: {
          materialId: loan.copy.materialId,
          status: ReservationStatus.PENDING,
        },
        orderBy: {
          reservationDate: 'asc', // First in queue
        },
      });

      if (pendingReservation) {
        // Assign the copy to the first reservation in queue
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // 7 days to pick up

        await tx.reservation.update({
          where: { id: pendingReservation.id },
          data: {
            status: ReservationStatus.READY,
            copyId: loan.copyId,
            expirationDate,
          },
        });

        // Update copy status to RESERVED instead of AVAILABLE
        await tx.materialCopy.update({
          where: { id: loan.copyId },
          data: { status: MaterialCopyStatus.RESERVED },
        });

        // Update queue positions for remaining pending reservations
        const remainingReservations = await tx.reservation.findMany({
          where: {
            materialId: loan.copy.materialId,
            status: ReservationStatus.PENDING,
            id: { not: pendingReservation.id },
          },
          orderBy: { reservationDate: 'asc' },
        });

        for (let i = 0; i < remainingReservations.length; i++) {
          await tx.reservation.update({
            where: { id: remainingReservations[i].id },
            data: { queuePosition: i + 1 },
          });
        }
      }

      return updatedLoan;
    });
  }

  async renewLoan(id: string) {
    const loan = await this.findOne(id);
    const config = await this.configService.getConfiguration();

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException(
        `Loan is not active. Current status: ${loan.status}`,
      );
    }

    if (loan.renewalCount >= config.maxRenewals) {
      throw new BadRequestException(
        `Loan has reached maximum number of renewals (${config.maxRenewals})`,
      );
    }

    // Check if loan is overdue
    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    if (now > dueDate) {
      throw new BadRequestException(
        'Cannot renew an overdue loan. Please return the item first.',
      );
    }

    // Check for unpaid fines
    if (!config.allowLoansWithFines) {
      const fineStats = await this.finesService.getMemberFineStats(
        loan.memberId,
      );
      if (fineStats.unpaidFines > 0) {
        throw new BadRequestException(
          `Member has unpaid fines totaling $${fineStats.unpaidFines.toFixed(2)}. Please pay fines before renewing.`,
        );
      }
    }

    // Calculate new due date
    const loanDays = loan.copy.material.maxLoanDays || config.defaultLoanDays;
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + loanDays);

    return this.prisma.loan.update({
      where: { id },
      data: {
        dueDate: newDueDate,
        renewalCount: loan.renewalCount + 1,
      },
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
        processedBy: {
          include: {
            user: true,
          },
        },
        fines: true,
      },
    });
  }

  async getMemberLoanStats(memberId: string) {
    const activeLoans = await this.prisma.loan.count({
      where: {
        memberId,
        status: LoanStatus.ACTIVE,
        deletedAt: null,
      },
    });

    const overdueLoans = await this.prisma.loan.count({
      where: {
        memberId,
        status: LoanStatus.OVERDUE,
        deletedAt: null,
      },
    });

    const fineStats = await this.finesService.getMemberFineStats(memberId);
    const config = await this.configService.getConfiguration();

    const canBorrow =
      activeLoans < config.maxActiveLoans &&
      overdueLoans === 0 &&
      (config.allowLoansWithFines || fineStats.unpaidFines === 0);

    const reasons: string[] = [];
    if (activeLoans >= config.maxActiveLoans) {
      reasons.push(`Maximum active loans reached (${config.maxActiveLoans})`);
    }
    if (overdueLoans > 0) {
      reasons.push(`Has ${overdueLoans} overdue loan(s)`);
    }
    if (!config.allowLoansWithFines && fineStats.unpaidFines > 0) {
      reasons.push(`Has unpaid fines ($${fineStats.unpaidFines.toFixed(2)})`);
    }

    return {
      activeLoans,
      overdueLoans,
      totalFines: fineStats.totalFines,
      unpaidFines: fineStats.unpaidFines,
      canBorrow,
      reasons: reasons.length > 0 ? reasons : undefined,
    };
  }

  async updateOverdueLoans() {
    const now = new Date();

    // Find all active loans that are past due date
    const overdueLoans = await this.prisma.loan.findMany({
      where: {
        status: LoanStatus.ACTIVE,
        dueDate: {
          lt: now.toISOString(),
        },
        deletedAt: null,
      },
    });

    // Update their status to OVERDUE
    const updatePromises = overdueLoans.map((loan) =>
      this.prisma.loan.update({
        where: { id: loan.id },
        data: { status: LoanStatus.OVERDUE },
      }),
    );

    await Promise.all(updatePromises);

    return {
      updated: overdueLoans.length,
      loanIds: overdueLoans.map((loan) => loan.id),
    };
  }
}
