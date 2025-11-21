import {
  LoginCredentials,
  LoginResponse,
  RegisterMemberData,
  RegisterMemberResponse,
  RegisterLibrarianData,
  RegisterLibrarianResponse,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class AuthApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new AuthApiError(
      error.message || 'An error occurred',
      response.status,
      error.errors
    );
  }
  return response.json();
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<LoginResponse>(response);
  },

  async registerMember(
    data: RegisterMemberData
  ): Promise<RegisterMemberResponse> {
    const response = await fetch(`${API_URL}/auth/register/member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterMemberResponse>(response);
  },

  async registerLibrarian(
    data: RegisterLibrarianData
  ): Promise<RegisterLibrarianResponse> {
    const response = await fetch(`${API_URL}/auth/register/librarian`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterLibrarianResponse>(response);
  },

  async getCurrentUser(token: string) {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};
