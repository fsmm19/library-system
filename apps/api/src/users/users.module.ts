import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserFactory } from './factories/user.factory';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserFactory],
  exports: [UsersService, UserFactory],
})
export class UsersModule {}
