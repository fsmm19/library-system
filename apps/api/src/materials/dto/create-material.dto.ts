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
import { CreateCategoryDto } from './create-category.dto';
import { MaterialType, Language } from 'generated/prisma/enums';

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

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorDto)
  authors: CreateAuthorDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  @IsOptional()
  categories?: CreateCategoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBookDto)
  book?: CreateBookDto;
}
