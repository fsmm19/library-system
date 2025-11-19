import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLibrarianDto } from './dto/create-librarian.dto';
import { UpdateLibrarianDto } from './dto/update-librarian.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from 'src/users/factories/user.factory';

@Injectable()
export class LibrariansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userFactory: UserFactory,
  ) {}

  async create(createLibrarianDto: CreateLibrarianDto) {
    return this.userFactory.createLibrarian({
      email: createLibrarianDto.email,
      password: createLibrarianDto.password,
      firstName: createLibrarianDto.firstName,
      middleName: createLibrarianDto.middleName,
      lastName: createLibrarianDto.lastName,
      hireDate: createLibrarianDto.hireDate,
    });
  }

  async findAll() {
    return this.prisma.librarian.findMany({
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
        hireDate: 'desc',
      },
    });
  }

  async findOne(userId: string) {
    const librarian = await this.prisma.librarian.findUnique({
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

    if (!librarian) {
      throw new NotFoundException(`Librarian with userId ${userId} not found`);
    }

    if (librarian.user.deletedAt) {
      throw new NotFoundException(`Librarian with userId ${userId} not found`);
    }

    return librarian;
  }

  async getMyProfile(userId: string) {
    return this.findOne(userId);
  }

  async update(userId: string, updateLibrarianDto: UpdateLibrarianDto) {
    await this.findOne(userId);

    return this.prisma.$transaction(async (tx) => {
      const { hireDate, isActive, endDate, ...userFields } = updateLibrarianDto;

      if (Object.keys(userFields).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userFields,
        });
      }

      const librarianUpdateData: {
        hireDate?: Date;
        isActive?: boolean;
        endDate?: Date | null;
      } = {};

      if (hireDate !== undefined) librarianUpdateData.hireDate = hireDate;
      if (isActive !== undefined) librarianUpdateData.isActive = isActive;
      if (endDate !== undefined) librarianUpdateData.endDate = endDate;

      if (Object.keys(librarianUpdateData).length > 0) {
        await tx.librarian.update({
          where: { userId },
          data: librarianUpdateData,
        });
      }

      return tx.librarian.findUnique({
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

  async deactivate(userId: string) {
    return this.update(userId, {
      isActive: false,
      endDate: new Date(),
    });
  }

  async activate(userId: string) {
    return this.update(userId, {
      isActive: true,
      endDate: null,
    });
  }

  async findActive() {
    return this.prisma.librarian.findMany({
      where: {
        isActive: true,
        user: {
          deletedAt: null,
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
      orderBy: {
        hireDate: 'desc',
      },
    });
  }

  async findInactive() {
    return this.prisma.librarian.findMany({
      where: {
        isActive: false,
        user: {
          deletedAt: null,
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
      orderBy: {
        endDate: 'desc',
      },
    });
  }
}
