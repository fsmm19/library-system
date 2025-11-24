import { Notification } from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

export const notificationsApi = {
  async getNotifications(
    token: string,
    unreadOnly = false
  ): Promise<Notification[]> {
    const url = unreadOnly
      ? `${API_URL}/notifications?unreadOnly=true`
      : `${API_URL}/notifications`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  async getUnreadCount(token: string): Promise<{ count: number }> {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  async markAsRead(
    notificationId: string,
    token: string
  ): Promise<Notification> {
    const response = await fetch(
      `${API_URL}/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return handleResponse(response);
  },

  async markAllAsRead(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  async deleteNotification(
    notificationId: string,
    token: string
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  async deleteAllRead(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/notifications/read/all`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },
};
