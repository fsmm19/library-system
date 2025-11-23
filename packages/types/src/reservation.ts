import { ReservationStatus } from './enums';
import { MaterialCopy } from './material-copy';
import { MaterialWithDetails } from './material';
import { MemberWithUser } from './user';

export interface Reservation {
  id: string;
  reservationDate: string;
  expirationDate: string | null;
  status: ReservationStatus;
  queuePosition: number | null;
  notes: string | null;
  confirmedAt: string | null;
  pickedUpAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  copyId: string | null;
  materialId: string;
}

export interface ReservationWithDetails extends Reservation {
  member: MemberWithUser;
  copy: MaterialCopy | null;
  material: MaterialWithDetails;
}

export interface CreateReservationData {
  materialId: string;
  memberId: string;
  notes?: string;
}

export interface UpdateReservationStatusData {
  status: ReservationStatus;
  copyId?: string;
  expirationDate?: string;
  notes?: string;
}

export interface GetReservationsParams {
  memberId?: string;
  materialId?: string;
  status?: ReservationStatus;
  page?: number;
  pageSize?: number;
}

export interface GetReservationsResponse {
  reservations: ReservationWithDetails[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MemberReservationStats {
  activeReservations: number;
  readyForPickup: number;
  confirmedPickup: number;
  totalReservations: number;
}
