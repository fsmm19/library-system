import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LibrariansService } from './librarians.service';
import { UpdateLibrarianDto } from './dto/update-librarian.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('librarians')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LIBRARIAN)
export class LibrariansController {
  constructor(private readonly librariansService: LibrariansService) {}

  @Get()
  async findAll() {
    return this.librariansService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.librariansService.findActive();
  }

  @Get('inactive')
  async findInactive() {
    return this.librariansService.findInactive();
  }

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.librariansService.getMyProfile(user.id);
  }

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateLibrarianDto: UpdateLibrarianDto,
  ) {
    const { isActive, hireDate, endDate, ...allowedFields } =
      updateLibrarianDto;

    return this.librariansService.update(user.id, allowedFields);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.librariansService.findOne(userId);
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateLibrarianDto: UpdateLibrarianDto,
  ) {
    return this.librariansService.update(userId, updateLibrarianDto);
  }

  @Post(':userId/deactivate')
  async deactivate(@Param('userId') userId: string) {
    return this.librariansService.deactivate(userId);
  }

  @Post(':userId/reactivate')
  async reactivate(@Param('userId') userId: string) {
    return this.librariansService.activate(userId);
  }
}
