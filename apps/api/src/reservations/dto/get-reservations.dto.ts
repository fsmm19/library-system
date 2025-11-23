import { IsEnum, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from 'generated/prisma/enums';

export class GetReservationsDto {
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsUUID()
  materialId?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
