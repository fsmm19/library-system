import { LoanStatus, FineStatus } from './enums';
import { Material } from './material';
import { MaterialCopy } from './material-copy';
import { User, MemberWithUser, LibrarianWithUser } from './user';

// Loan types
export interface Loan {
  id: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  renewalCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  memberId: string;
  copyId: string;
  processedById: string;
}

export interface LoanWithDetails extends Loan {
  member: MemberWithUser;
  copy: MaterialCopy & { material: Material };
  processedBy: LibrarianWithUser;
  fines?: Fine[];
}

// Fine types
export interface Fine {
  id: string;
  amount: number;
  paidAmount: number;
  status: FineStatus;
  reason: string;
  notes: string | null;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  loanId: string;
  issuedById: string;
}

export interface FineWithDetails extends Fine {
  loan: LoanWithDetails;
  issuedBy: LibrarianWithUser;
}

// Loan Configuration types
export interface LoanConfiguration {
  id: string;
  defaultLoanDays: number;
  maxActiveLoans: number;
  maxRenewals: number;
  gracePeriodDays: number;
  dailyFineAmount: number;
  allowLoansWithFines: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreateLoanData {
  memberId: string;
  copyId: string;
  loanDate?: string;
  notes?: string;
}

export interface UpdateLoanData {
  returnDate?: string;
  status?: LoanStatus;
  notes?: string;
}

export interface RenewLoanData {
  loanId: string;
}

export interface CreateFineData {
  loanId: string;
  amount: number;
  reason: string;
  notes?: string;
}

export interface UpdateFineData {
  paidAmount?: number;
  status?: FineStatus;
  notes?: string;
  paidDate?: string;
}

export interface UpdateLoanConfigurationData {
  defaultLoanDays?: number;
  maxActiveLoans?: number;
  maxRenewals?: number;
  gracePeriodDays?: number;
  dailyFineAmount?: number;
  allowLoansWithFines?: boolean;
}

export interface GetLoansParams {
  memberId?: string;
  status?: LoanStatus;
  overdue?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetLoansResponse {
  loans: LoanWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetFinesParams {
  memberId?: string;
  status?: FineStatus;
  page?: number;
  pageSize?: number;
}

export interface GetFinesResponse {
  fines: FineWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MemberLoanStats {
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
  unpaidFines: number;
  canBorrow: boolean;
  reasons?: string[];
}
