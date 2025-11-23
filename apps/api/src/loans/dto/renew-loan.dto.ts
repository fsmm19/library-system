import { IsNotEmpty, IsUUID } from 'class-validator';

export class RenewLoanDto {
  @IsUUID()
  @IsNotEmpty()
  loanId: string;
}
