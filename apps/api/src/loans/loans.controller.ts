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
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { GetLoansDto } from './dto/get-loans.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  create(@Body() createLoanDto: CreateLoanDto, @CurrentUser() user: any) {
    return this.loansService.create(createLoanDto, user.id);
  }

  @Get()
  findAll(@Query() getLoansDto: GetLoansDto, @CurrentUser() user: any) {
    // If user is a member, only show their loans
    if (user.role === Role.MEMBER) {
      getLoansDto.memberId = user.id;
    }
    return this.loansService.findAll(getLoansDto);
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
    return this.loansService.getMemberLoanStats(memberId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.findOne(id);
  }

  @Post(':id/return')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  returnLoan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { returnDate?: string },
  ) {
    return this.loansService.returnLoan(id, body.returnDate);
  }

  @Post(':id/renew')
  renewLoan(@Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.renewLoan(id);
  }

  @Post('update-overdue')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateOverdueLoans() {
    return this.loansService.updateOverdueLoans();
  }
}
