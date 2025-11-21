import {
  IsString,
  IsOptional,
  IsISBN,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsOptional()
  @IsISBN(13)
  isbn13?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  edition?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfPages?: number;
}
