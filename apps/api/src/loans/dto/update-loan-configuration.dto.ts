import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateLoanConfigurationDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  defaultLoanDays?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxActiveLoans?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxRenewals?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  gracePeriodDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyFineAmount?: number;

  @IsBoolean()
  @IsOptional()
  allowLoansWithFines?: boolean;
}
