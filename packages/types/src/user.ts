import { AccountState, MemberCondition, Role } from './enums';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  middleName: string | null;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  member?: MemberData | null;
  librarian?: LibrarianData | null;
}

export interface MemberData {
  accountState: AccountState;
  conditions: MemberCondition[];
}

export interface LibrarianData {
  isActive: boolean;
  hireDate: string;
  endDate: string | null;
}

export interface Member {
  userId: string;
  accountState: AccountState;
  conditions: MemberCondition[];
}

export interface Librarian {
  userId: string;
  isActive: boolean;
  hireDate: string;
  endDate: string | null;
}
