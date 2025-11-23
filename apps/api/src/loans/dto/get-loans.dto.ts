import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoanStatus } from 'generated/prisma/enums';

export class GetLoansDto {
  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  overdue?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 20;
}
