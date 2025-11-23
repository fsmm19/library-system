import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAuthorDto } from './create-author.dto';
import { CreateBookDto } from './create-book.dto';
import { MaterialType } from 'generated/prisma/enums';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaterialType)
  @IsNotEmpty()
  type: MaterialType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  language: string;

  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorDto)
  authors: CreateAuthorDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBookDto)
  book?: CreateBookDto;
}
