import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsUUID,
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
}
