import { Module } from '@nestjs/common';
import { MaterialCopiesService } from './material-copies.service';
import { MaterialCopiesController } from './material-copies.controller';
import { MaterialCopyFactory } from './factories/material-copy.factory';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialCopiesController],
  providers: [MaterialCopiesService, MaterialCopyFactory],
  exports: [MaterialCopiesService],
})
export class MaterialCopiesModule {}
