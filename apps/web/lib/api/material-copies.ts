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

export const materialCopiesApi = {
  async getAll(token: string, materialId?: string): Promise<MaterialCopyWithDetails[]> {
    const url = materialId
      ? `${API_URL}/material-copies?materialId=${materialId}`
      : `${API_URL}/material-copies`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MaterialCopyWithDetails[]>(response);
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
