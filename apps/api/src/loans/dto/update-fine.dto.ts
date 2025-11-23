import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FineStatus } from 'generated/prisma/enums';

export class UpdateFineDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @IsEnum(FineStatus)
  @IsOptional()
  status?: FineStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  paidDate?: string;
}
