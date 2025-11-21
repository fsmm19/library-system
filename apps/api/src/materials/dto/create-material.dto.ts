import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAuthorDto } from './create-author.dto';
import { CreateBookDto } from './create-book.dto';

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
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  language: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorDto)
  authors: CreateAuthorDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBookDto)
  book?: CreateBookDto;
}
