import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { MaterialCopiesService } from './material-copies.service';
import { CreateMaterialCopyDto } from './dto/create-material-copy.dto';
import { UpdateMaterialCopyDto } from './dto/update-material-copy.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('material-copies')
export class MaterialCopiesController {
  constructor(
    private readonly materialCopiesService: MaterialCopiesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  create(@Body() createMaterialCopyDto: CreateMaterialCopyDto) {
    return this.materialCopiesService.create(createMaterialCopyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('materialId') materialId?: string) {
    if (materialId) {
      return this.materialCopiesService.findByMaterial(materialId);
    }
    return this.materialCopiesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialCopiesService.findOne(id);
  }

  @Get('material/:materialId/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Param('materialId', ParseUUIDPipe) materialId: string) {
    const [available, total] = await Promise.all([
      this.materialCopiesService.getAvailableCount(materialId),
      this.materialCopiesService.getTotalCount(materialId),
    ]);

    return {
      available,
      total,
      borrowed: total - available,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaterialCopyDto: UpdateMaterialCopyDto,
  ) {
    return this.materialCopiesService.update(id, updateMaterialCopyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialCopiesService.remove(id);
  }
}
