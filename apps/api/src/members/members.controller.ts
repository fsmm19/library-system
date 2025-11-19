import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { MemberCondition, Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  async findAll() {
    return this.membersService.findAll();
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async getMyProfile(@CurrentUser() user: any) {
    return this.membersService.getMyProfile(user.id);
  }

  @Get(':userId')
  async findOne(
    @CurrentUser() currentUser: any,
    @Param('userId') userId: string,
  ) {
    if (currentUser.role === Role.LIBRARIAN) {
      return this.membersService.findOne(userId);
    }

    // Members solo pueden ver su propio perfil
    if (currentUser.role === Role.MEMBER && currentUser.id === userId) {
      return this.membersService.findOne(userId);
    }

    throw new ForbiddenException('You can only access your own profile');
  }

  @Patch('me')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    const { accountState, conditions, ...userFields } = updateMemberDto;

    if (accountState !== undefined || conditions !== undefined) {
      throw new ForbiddenException(
        'You cannot modify your account state or conditions',
      );
    }

    return this.membersService.update(user.id, userFields);
  }

  @Post(':userId/suspend')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  async suspend(@Param('userId') userId: string) {
    return this.membersService.suspend(userId);
  }

  @Post(':userId/activate')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  async activate(@Param('userId') userId: string) {
    return this.membersService.activate(userId);
  }

  @Post(':userId/conditions/:condition')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  async addCondition(
    @Param('userId') userId: string,
    @Param('condition') condition: MemberCondition,
  ) {
    return this.membersService.addCondition(userId, condition);
  }

  @Delete(':userId/conditions/:condition')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  async removeCondition(
    @Param('userId') userId: string,
    @Param('condition') condition: MemberCondition,
  ) {
    return this.membersService.removeCondition(userId, condition);
  }

  @Get(':userId/can-borrow')
  async canBorrow(
    @CurrentUser() currentUser: any,
    @Param('userId') userId: string,
  ) {
    if (currentUser.role === Role.LIBRARIAN) {
      const canBorrow = await this.membersService.canBorrow(userId);
      return { canBorrow };
    }

    if (currentUser.role === Role.MEMBER && currentUser.id === userId) {
      const canBorrow = await this.membersService.canBorrow(userId);
      return { canBorrow };
    }

    throw new ForbiddenException('You can only check your own borrow status');
  }
}
