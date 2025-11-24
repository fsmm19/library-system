import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLoanConfigurationDto } from './dto/update-loan-configuration.dto';

@Injectable()
export class LoanConfigurationService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfiguration() {
    // Get the first (and only) configuration record
    let config = await this.prisma.loanConfiguration.findFirst();

    // If no configuration exists, create default one
    if (!config) {
      config = await this.prisma.loanConfiguration.create({
        data: {
          defaultLoanDays: 14,
          maxActiveLoans: 5,
          maxRenewals: 2,
          gracePeriodDays: 0,
          dailyFineAmount: 1.0,
          allowLoansWithFines: false,
          reservationHoldDays: 3,
        },
      });
    }

    return config;
  }

  async updateConfiguration(updateDto: UpdateLoanConfigurationDto) {
    const config = await this.getConfiguration();

    return this.prisma.loanConfiguration.update({
      where: { id: config.id },
      data: updateDto,
    });
  }
}
