import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialCopyDto } from './create-material-copy.dto';
import { IsEnum, IsOptional } from 'class-validator';
import {
  MaterialCopyCondition,
  MaterialCopyStatus,
} from 'generated/prisma/enums';

export class UpdateMaterialCopyDto extends PartialType(
  CreateMaterialCopyDto,
) {
  @IsEnum(MaterialCopyCondition)
  @IsOptional()
  condition?: MaterialCopyCondition;

  @IsEnum(MaterialCopyStatus)
  @IsOptional()
  status?: MaterialCopyStatus;
}
