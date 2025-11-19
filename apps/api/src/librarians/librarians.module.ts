import { Module } from '@nestjs/common';
import { LibrariansService } from './librarians.service';
import { LibrariansController } from './librarians.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [LibrariansController],
  providers: [LibrariansService],
  exports: [LibrariansService],
})
export class LibrariansModule {}
