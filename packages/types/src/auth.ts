import { Librarian, Member, User } from './user';
import { Role } from './enums';

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterMemberResponse {
  accessToken: string;
  user: User;
  member: Member;
}

export interface RegisterLibrarianResponse {
  user: User;
  librarian: Librarian;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterMemberData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface RegisterLibrarianData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  hireDate: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
