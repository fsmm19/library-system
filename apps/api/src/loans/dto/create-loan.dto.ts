import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateLoanDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsUUID()
  @IsNotEmpty()
  copyId: string;

  @IsDateString()
  @IsOptional()
  loanDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
