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
  Delete,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: any,
  ) {
    // Members can only create reservations for themselves
    if (user.role === Role.MEMBER) {
      createReservationDto.memberId = user.id;
    }
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll(
    @Query() getReservationsDto: GetReservationsDto,
    @CurrentUser() user: any,
  ) {
    // Members can only see their own reservations
    if (user.role === Role.MEMBER) {
      getReservationsDto.memberId = user.id;
    }
    return this.reservationsService.findAll(getReservationsDto);
  }

  @Get('stats/:memberId')
  getMemberStats(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: any,
  ) {
    // Members can only view their own stats
    if (user.role === Role.MEMBER && user.id !== memberId) {
      memberId = user.id;
    }
    return this.reservationsService.getMemberStats(memberId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(
      id,
      updateReservationStatusDto,
    );
  }

  @Post(':id/confirm-pickup')
  confirmPickup(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    // Members can only confirm pickup for their own reservations
    return this.reservationsService.confirmPickup(id, user.id);
  }

  @Delete(':id')
  cancelReservation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.reservationsService.cancelReservation(id, user.id);
  }

  @Post('update-expired')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateExpiredReservations() {
    return this.reservationsService.updateExpiredReservations();
  }
}
