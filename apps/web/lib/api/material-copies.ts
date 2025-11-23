import {
  MaterialCopyWithDetails,
  CreateMaterialCopyData,
  UpdateMaterialCopyData,
  MaterialCopyStats,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class MaterialCopiesApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'MaterialCopiesApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new MaterialCopiesApiError(
      error.message || 'An error occurred',
      response.status,
      error.errors
    );
  }
  return response.json();
}

export interface GetMaterialCopiesParams {
  materialId?: string;
  status?: string;
}

export interface GetMaterialCopiesResponse {
  copies: MaterialCopyWithDetails[];
  total?: number;
}

export const materialCopiesApi = {
  async getAll(params: GetMaterialCopiesParams, token: string): Promise<GetMaterialCopiesResponse> {
    const queryParams = new URLSearchParams();

    if (params.materialId) queryParams.append('materialId', params.materialId);
    if (params.status) queryParams.append('status', params.status);

    const url = queryParams.toString()
      ? `${API_URL}/material-copies?${queryParams.toString()}`
      : `${API_URL}/material-copies`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const copies = await handleResponse<MaterialCopyWithDetails[]>(response);
    return { copies, total: copies.length };
  },

  async getById(id: string, token: string): Promise<MaterialCopyWithDetails> {
    const response = await fetch(`${API_URL}/material-copies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MaterialCopyWithDetails>(response);
  },

  async getStats(materialId: string, token: string): Promise<MaterialCopyStats> {
    const response = await fetch(
      `${API_URL}/material-copies/material/${materialId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return handleResponse<MaterialCopyStats>(response);
  },

  async create(
    data: CreateMaterialCopyData,
    token: string
  ): Promise<MaterialCopyWithDetails> {
    const response = await fetch(`${API_URL}/material-copies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<MaterialCopyWithDetails>(response);
  },

  async update(
    id: string,
    data: UpdateMaterialCopyData,
    token: string
  ): Promise<MaterialCopyWithDetails> {
    const response = await fetch(`${API_URL}/material-copies/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<MaterialCopyWithDetails>(response);
  },

  async delete(id: string, token: string): Promise<MaterialCopyWithDetails> {
    const response = await fetch(`${API_URL}/material-copies/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MaterialCopyWithDetails>(response);
  },
};
