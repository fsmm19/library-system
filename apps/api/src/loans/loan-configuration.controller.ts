import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LoanConfigurationService } from './loan-configuration.service';
import { UpdateLoanConfigurationDto } from './dto/update-loan-configuration.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('loan-configuration')
@UseGuards(JwtAuthGuard)
export class LoanConfigurationController {
  constructor(
    private readonly configService: LoanConfigurationService,
  ) {}

  @Get()
  getConfiguration() {
    return this.configService.getConfiguration();
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateConfiguration(@Body() updateDto: UpdateLoanConfigurationDto) {
    return this.configService.updateConfiguration(updateDto);
  }
}
