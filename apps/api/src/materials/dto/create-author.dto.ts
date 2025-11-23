import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsDateString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateAuthorDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @ValidateIf((o) => !o.id)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ValidateIf((o) => !o.id)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @ValidateIf((o) => !o.id)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ValidateIf((o) => !o.id)
  @IsUUID()
  @IsOptional()
  countryOfOriginId?: string;

  @ValidateIf((o) => !o.id)
  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
