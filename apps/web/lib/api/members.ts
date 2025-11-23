import type { MemberWithUser } from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class MembersApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'MembersApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new MembersApiError(
      error.message || 'An error occurred',
      response.status,
      error.errors
    );
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const membersApi = {
  async getAll(token: string): Promise<MemberWithUser[]> {
    const response = await fetch(`${API_URL}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MemberWithUser[]>(response);
  },

  async getOne(userId: string, token: string): Promise<MemberWithUser> {
    const response = await fetch(`${API_URL}/members/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MemberWithUser>(response);
  },
};
