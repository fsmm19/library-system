import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserFactory } from 'src/users/factories/user.factory';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterLibrarianDto } from './dto/register-librarian.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userFactory: UserFactory,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email).catch(() => {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    });

    const isPasswordValid = await this.userFactory.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        theme: user.theme,
        notifications: user.notifications,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async registerMember(registerMemberDto: RegisterMemberDto) {
    const emailExists = await this.usersService.emailExists(
      registerMemberDto.email,
    );

    if (emailExists) {
      throw new ConflictException(
        'Ya existe una cuenta con este correo electrónico',
      );
    }

    const { user, member } =
      await this.userFactory.createMember(registerMemberDto);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        theme: user.theme,
        notifications: user.notifications,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      member,
    };
  }

  async registerLibrarian(registerLibrarianDto: RegisterLibrarianDto) {
    const emailExists = await this.usersService.emailExists(
      registerLibrarianDto.email,
    );

    if (emailExists) {
      throw new ConflictException(
        'Ya existe una cuenta con este correo electrónico',
      );
    }

    const { user, librarian } =
      await this.userFactory.createLibrarian(registerLibrarianDto);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        theme: user.theme,
        notifications: user.notifications,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      librarian,
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOneWithPassword(userId);

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await this.userFactory.comparePasswords(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Actualizar la contraseña
    const hashedPassword = await this.userFactory.hashPassword(
      changePasswordDto.newPassword,
    );

    await this.usersService.updatePassword(userId, hashedPassword);
  }
}
