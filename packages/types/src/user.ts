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
