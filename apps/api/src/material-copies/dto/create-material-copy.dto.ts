import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import {
  MaterialCopyCondition,
  MaterialCopyStatus,
} from 'generated/prisma/enums';

export class CreateMaterialCopyDto {
  @IsUUID()
  @IsNotEmpty()
  materialId: string;

  @IsDateString()
  @IsNotEmpty()
  acquisitionDate: string;

  @IsEnum(MaterialCopyCondition)
  @IsNotEmpty()
  condition: MaterialCopyCondition;

  @IsEnum(MaterialCopyStatus)
  @IsNotEmpty()
  status: MaterialCopyStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  barcode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  catalogCode?: string;
}
