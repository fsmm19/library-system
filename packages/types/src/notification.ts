export enum NotificationType {
  LOAN_DUE_SOON = 'LOAN_DUE_SOON',
  LOAN_OVERDUE = 'LOAN_OVERDUE',
  RESERVATION_READY = 'RESERVATION_READY',
  RESERVATION_EXPIRED = 'RESERVATION_EXPIRED',
  FINE_ISSUED = 'FINE_ISSUED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  GENERAL = 'GENERAL',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  userId: string;
}

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
}
