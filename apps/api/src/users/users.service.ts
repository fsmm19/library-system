import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUsersDto) {
    const { role, search, page = 1, limit = 10 } = query;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          middleName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
          member: {
            select: {
              accountState: true,
              conditions: true,
            },
          },
          librarian: {
            select: {
              isActive: true,
              hireDate: true,
              endDate: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        middleName: true,
        lastName: true,
        theme: true,
        notifications: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            accountState: true,
            conditions: true,
          },
        },
        librarian: {
          select: {
            isActive: true,
            hireDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findOneWithPassword(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        middleName: updateUserDto.middleName,
        lastName: updateUserDto.lastName,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        middleName: true,
        lastName: true,
        theme: true,
        notifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'User successfully deleted' };
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });
  }

  async updatePreferences(userId: string, preferencesDto: any) {
    await this.findOne(userId);

    console.log('updatePreferences - userId:', userId);
    console.log('updatePreferences - preferencesDto:', preferencesDto);

    // Preparar los datos a actualizar
    const updateData: any = {};

    // Transformar el tema a mayúsculas si existe
    if (preferencesDto.theme !== undefined) {
      updateData.theme = preferencesDto.theme.toUpperCase();
      console.log('Tema transformado:', updateData.theme);
    }

    // Actualizar notificaciones si existe
    if (preferencesDto.notifications !== undefined) {
      updateData.notifications = preferencesDto.notifications;
    }

    console.log('updateData a guardar:', updateData);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        middleName: true,
        lastName: true,
        theme: true,
        notifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Usuario actualizado:', updatedUser);

    return updatedUser;
  }
}
