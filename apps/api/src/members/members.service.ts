import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from 'src/users/factories/user.factory';
import { AccountState, MemberCondition } from 'generated/prisma/enums';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userFactory: UserFactory,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    return this.userFactory.createMember({
      email: createMemberDto.email,
      password: createMemberDto.password,
      firstName: createMemberDto.firstName,
      middleName: createMemberDto.middleName,
      lastName: createMemberDto.lastName,
    });
  }

  async findAll() {
    return this.prisma.member.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
      where: {
        user: {
          deletedAt: null,
        },
      },
      orderBy: {
        user: {
          createdAt: 'desc',
        },
      },
    });
  }

  async findOne(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            middleName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with userId ${userId} not found`);
    }

    if (member.user.deletedAt) {
      throw new NotFoundException(`Member with userId ${userId} not found`);
    }

    return member;
  }

  async getMyProfile(userId: string) {
    return this.findOne(userId);
  }

  async update(userId: string, updateMemberDto: UpdateMemberDto) {
    await this.findOne(userId);

    return this.prisma.$transaction(async (tx) => {
      const { accountState, conditions, ...userFields } = updateMemberDto;

      if (Object.keys(userFields).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userFields,
        });
      }

      const memberUpdateData: {
        accountState?: AccountState;
        conditions?: MemberCondition[];
      } = {};

      if (accountState !== undefined) {
        memberUpdateData.accountState = accountState;
      }

      if (conditions !== undefined) {
        memberUpdateData.conditions = conditions;
      }

      if (Object.keys(memberUpdateData).length > 0) {
        await tx.member.update({
          where: { userId },
          data: memberUpdateData,
        });
      }

      return tx.member.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              middleName: true,
              lastName: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    });
  }

  async suspend(userId: string) {
    return this.update(userId, {
      accountState: AccountState.SUSPENDED,
    });
  }

  async activate(userId: string) {
    return this.update(userId, {
      accountState: AccountState.ACTIVE,
    });
  }

  async addCondition(userId: string, condition: MemberCondition) {
    const member = await this.findOne(userId);

    if (member.conditions.includes(condition)) {
      return member;
    }

    return this.prisma.member.update({
      where: { userId },
      data: {
        conditions: {
          push: condition,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async removeCondition(userId: string, condition: MemberCondition) {
    const member = await this.findOne(userId);

    const updatedConditions = member.conditions.filter((c) => c !== condition);

    return this.prisma.member.update({
      where: { userId },
      data: {
        conditions: updatedConditions,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async canBorrow(userId: string): Promise<boolean> {
    const member = await this.findOne(userId);

    if (member.accountState === AccountState.SUSPENDED) {
      return false;
    }

    const blockingConditions = new Set<MemberCondition>([
      MemberCondition.HAS_FINE,
      MemberCondition.LOST_COPY,
    ]);

    const hasBlockingCondition = member.conditions.some((condition) =>
      blockingConditions.has(condition),
    );

    return !hasBlockingCondition;
  }
}
