import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { LibrariansModule } from './librarians/librarians.module';
import { AuthModule } from './auth/auth.module';
import { MaterialsModule } from './materials/materials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MembersModule,
    LibrariansModule,
    MaterialsModule,
  ],
})
export class AppModule {}
