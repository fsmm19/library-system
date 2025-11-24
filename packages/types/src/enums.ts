export enum Role {
  MEMBER = 'MEMBER',
  LIBRARIAN = 'LIBRARIAN',
}

export enum AccountState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum MemberCondition {
  HAS_LATE_RETURN = 'HAS_LATE_RETURN',
  HAS_FINE = 'HAS_FINE',
  LOST_COPY = 'LOST_COPY',
}

export enum MaterialType {
  BOOK = 'BOOK',
  MAGAZINE = 'MAGAZINE',
  DVD = 'DVD',
  OTHER = 'OTHER',
}

export enum MaterialCopyCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

export enum MaterialCopyStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  UNDER_REPAIR = 'UNDER_REPAIR',
  REMOVED = 'REMOVED',
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum FineStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  WAIVED = 'WAIVED',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  PICKED_UP = 'PICKED_UP',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum Language {
  EN = 'EN',
  ES = 'ES',
  FR = 'FR',
  DE = 'DE',
  OTHER = 'OTHER',
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export enum NotificationType {
  LOAN_DUE_SOON = 'LOAN_DUE_SOON',
  LOAN_OVERDUE = 'LOAN_OVERDUE',
  RESERVATION_READY = 'RESERVATION_READY',
  RESERVATION_EXPIRED = 'RESERVATION_EXPIRED',
  FINE_ISSUED = 'FINE_ISSUED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  GENERAL = 'GENERAL',
}
