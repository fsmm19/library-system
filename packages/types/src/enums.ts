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
