import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountState, Role } from 'generated/prisma/enums';
import { CreateLibrarianDto } from 'src/librarians/dto/create-librarian.dto';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserFactory {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  async createMember(data: CreateMemberDto) {
    const passwordHash = await this.hashPassword(data.password);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: Role.MEMBER,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          accountState: AccountState.ACTIVE,
        },
      });

      return { user, member };
    });
  }

  async createLibrarian(data: CreateLibrarianDto) {
    const passwordHash = await this.hashPassword(data.password);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: Role.LIBRARIAN,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
        },
      });

      const librarian = await tx.librarian.create({
        data: {
          userId: user.id,
          isActive: true,
          hireDate: data.hireDate,
        },
      });

      return { user, librarian };
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
