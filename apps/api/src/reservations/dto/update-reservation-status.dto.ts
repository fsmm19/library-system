import {
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  MaxLength,
} from 'class-validator';
import { ReservationStatus } from 'generated/prisma/enums';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @IsOptional()
  @IsUUID()
  copyId?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
