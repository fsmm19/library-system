import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { FinesService } from './fines.service';
import { FinesController } from './fines.controller';
import { LoanConfigurationService } from './loan-configuration.service';
import { LoanConfigurationController } from './loan-configuration.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    LoansController,
    FinesController,
    LoanConfigurationController,
  ],
  providers: [
    LoansService,
    FinesService,
    LoanConfigurationService,
  ],
  exports: [
    LoansService,
    FinesService,
    LoanConfigurationService,
  ],
})
export class LoansModule {}
