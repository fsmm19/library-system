import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { MaterialFactory } from './factories/material.factory';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialsController],
  providers: [MaterialsService, MaterialFactory],
  exports: [MaterialsService],
})
export class MaterialsModule {}
