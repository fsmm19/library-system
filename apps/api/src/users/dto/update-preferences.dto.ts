import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Theme } from 'generated/prisma/enums';

export class UpdatePreferencesDto {
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(Theme, { message: 'El tema debe ser LIGHT, DARK o SYSTEM' })
  theme?: Theme;

  @IsOptional()
  @IsBoolean({ message: 'Las notificaciones deben ser true o false' })
  notifications?: boolean;
}
