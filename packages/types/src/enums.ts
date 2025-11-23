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
