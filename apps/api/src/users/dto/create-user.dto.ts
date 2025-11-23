import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @ValidateIf((o) => o.middleName !== '' && o.middleName !== null)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;
}
