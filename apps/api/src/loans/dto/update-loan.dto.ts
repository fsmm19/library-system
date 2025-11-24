import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LoanStatus } from 'generated/prisma/enums';
import { MaterialCopyCondition } from 'generated/prisma/enums';

export class UpdateLoanDto {
  @IsDateString()
  @IsOptional()
  returnDate?: string;

  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(MaterialCopyCondition)
  @IsOptional()
  condition?: MaterialCopyCondition;
}
