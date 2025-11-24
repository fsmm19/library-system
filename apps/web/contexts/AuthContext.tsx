'use client';

import { createContext, useContext } from 'react';
import {
  User,
  Member,
  Librarian,
  LoginCredentials,
  RegisterMemberData,
  RegisterLibrarianData,
  LoginResponse,
  RegisterMemberResponse,
  RegisterLibrarianResponse,
} from '@library/types';

export interface AuthState {
  user: User | null;
  member: Member | null;
  librarian: Librarian | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  registerMember: (data: RegisterMemberData) => Promise<RegisterMemberResponse>;
  registerLibrarian: (
    data: RegisterLibrarianData
  ) => Promise<RegisterLibrarianResponse>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
