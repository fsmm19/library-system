import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMaterialsDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  types?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsInt()
  @Min(1900)
  @IsOptional()
  @Type(() => Number)
  yearFrom?: number;

  @IsInt()
  @Max(2100)
  @IsOptional()
  @Type(() => Number)
  yearTo?: number;

  @IsString()
  @IsOptional()
  @IsIn([
    'relevance',
    'title-asc',
    'title-desc',
    'year-asc',
    'year-desc',
    'author',
  ])
  sortBy?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number;
}
