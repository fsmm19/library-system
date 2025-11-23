import {
  FineWithDetails,
  CreateFineData,
  UpdateFineData,
  GetFinesParams,
  GetFinesResponse,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class FinesApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'FinesApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    const responseText = await response.text();

    try {
      errorData = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Failed to parse error response:', responseText);
      errorData = {
        message: response.statusText || 'An error occurred',
      };
    }

    const message = errorData.message || errorData.error || 'An error occurred';
    const errors = errorData.errors;

    throw new FinesApiError(
      Array.isArray(message) ? message[0] : message,
      response.status,
      errors
    );
  }
  return response.json();
}

export const finesApi = {
  async getAll(
    params: GetFinesParams,
    token: string
  ): Promise<GetFinesResponse> {
    const queryParams = new URLSearchParams();

    if (params.memberId) queryParams.append('memberId', params.memberId);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize)
      queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_URL}/fines?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<GetFinesResponse>(response);
  },

  async getById(id: string, token: string): Promise<FineWithDetails> {
    const response = await fetch(`${API_URL}/fines/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<FineWithDetails>(response);
  },

  async create(data: CreateFineData, token: string): Promise<FineWithDetails> {
    const response = await fetch(`${API_URL}/fines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<FineWithDetails>(response);
  },

  async update(
    id: string,
    data: UpdateFineData,
    token: string
  ): Promise<FineWithDetails> {
    const response = await fetch(`${API_URL}/fines/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<FineWithDetails>(response);
  },

  async getMemberStats(
    memberId: string,
    token: string
  ): Promise<{ totalFines: number; unpaidFines: number; fineCount: number }> {
    const response = await fetch(`${API_URL}/fines/stats/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<{
      totalFines: number;
      unpaidFines: number;
      fineCount: number;
    }>(response);
  },
};
