import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  materialId: string;

  @IsUUID()
  memberId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
