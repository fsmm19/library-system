import type { User } from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface UpdateUserData {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}

export interface CreateMemberData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateLibrarianData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  hireDate: string;
}

export interface UsersResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UsersApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'UsersApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new UsersApiError(
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

export const usersApi = {
  async getAll(token: string, page = 1, limit = 100): Promise<UsersResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<UsersResponse>(response);
  },

  async getById(userId: string, token: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },

  async createMember(data: CreateMemberData): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register/member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ user: User }>(response);
    return result.user;
  },

  async createLibrarian(data: CreateLibrarianData, token: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register/librarian`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ user: User }>(response);
    return result.user;
  },

  async delete(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<void>(response);
  },

  async updateProfile(
    userId: string,
    data: UpdateUserData,
    token: string
  ): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },
};
