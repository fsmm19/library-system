import { NotificationType } from './enums';

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
