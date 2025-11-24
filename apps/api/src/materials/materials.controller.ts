import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { SearchMaterialsDto } from './dto/search-materials.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  @Public()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() searchDto: SearchMaterialsDto) {
    return this.materialsService.findAll(searchDto);
  }

  @Get('authors')
  @UseGuards(JwtAuthGuard)
  findAllAuthors() {
    return this.materialsService.findAllAuthors();
  }

  @Get('categories')
  @Public()
  @UseGuards(JwtAuthGuard)
  findAllCategories() {
    return this.materialsService.findAllCategories();
  }

  @Get('countries')
  @UseGuards(JwtAuthGuard)
  findAllCountries() {
    return this.materialsService.findAllCountries();
  }

  @Get('publishers')
  @UseGuards(JwtAuthGuard)
  findAllPublishers() {
    return this.materialsService.findAllPublishers();
  }

  @Get(':id')
  @Public()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.remove(id);
  }

  // Categories CRUD
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.materialsService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.materialsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  removeCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.removeCategory(id);
  }

  // Countries CRUD
  @Post('countries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.materialsService.createCountry(createCountryDto);
  }

  @Patch('countries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateCountry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.materialsService.updateCountry(id, updateCountryDto);
  }

  @Delete('countries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  removeCountry(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.removeCountry(id);
  }

  // Publishers CRUD
  @Post('publishers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  createPublisher(@Body() createPublisherDto: CreatePublisherDto) {
    return this.materialsService.createPublisher(createPublisherDto);
  }

  @Patch('publishers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  updatePublisher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePublisherDto: UpdatePublisherDto,
  ) {
    return this.materialsService.updatePublisher(id, updatePublisherDto);
  }

  @Delete('publishers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  removePublisher(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.removePublisher(id);
  }

  // Authors CRUD
  @Patch('authors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.materialsService.updateAuthor(id, updateAuthorDto);
  }

  @Delete('authors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  removeAuthor(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.removeAuthor(id);
  }
}
