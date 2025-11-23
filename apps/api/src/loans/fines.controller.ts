import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FinesService } from './fines.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { GetFinesDto } from './dto/get-fines.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('fines')
@UseGuards(JwtAuthGuard)
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  create(@Body() createFineDto: CreateFineDto, @CurrentUser() user: any) {
    return this.finesService.create(createFineDto, user.id);
  }

  @Get()
  findAll(@Query() getFinesDto: GetFinesDto, @CurrentUser() user: any) {
    // If user is a member, only show their fines
    if (user.role === Role.MEMBER) {
      getFinesDto.memberId = user.id;
    }
    return this.finesService.findAll(getFinesDto);
  }

  @Get('stats/:memberId')
  getMemberStats(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: any,
  ) {
    // Members can only view their own stats, librarians can view any
    if (user.role === Role.MEMBER && user.id !== memberId) {
      memberId = user.id;
    }
    return this.finesService.getMemberFineStats(memberId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.finesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFineDto: UpdateFineDto,
  ) {
    return this.finesService.update(id, updateFineDto);
  }
}
