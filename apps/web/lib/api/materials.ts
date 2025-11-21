import {
  MaterialWithDetails,
  CreateMaterialData,
  UpdateMaterialData,
  SearchMaterialsParams,
  SearchMaterialsResponse,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class MaterialsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'MaterialsApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new MaterialsApiError(
      error.message || 'An error occurred',
      response.status,
      error.errors
    );
  }
  return response.json();
}

export const materialsApi = {
  async search(params: SearchMaterialsParams): Promise<SearchMaterialsResponse> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.types) params.types.forEach(t => queryParams.append('types', t));
    if (params.languages) params.languages.forEach(l => queryParams.append('languages', l));
    if (params.authorName) queryParams.append('authorName', params.authorName);
    if (params.yearFrom) queryParams.append('yearFrom', params.yearFrom.toString());
    if (params.yearTo) queryParams.append('yearTo', params.yearTo.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_URL}/materials?${queryParams.toString()}`);
    return handleResponse<SearchMaterialsResponse>(response);
  },

  async getById(id: string): Promise<MaterialWithDetails> {
    const response = await fetch(`${API_URL}/materials/${id}`);
    return handleResponse<MaterialWithDetails>(response);
  },

  async create(
    data: CreateMaterialData,
    token: string
  ): Promise<MaterialWithDetails> {
    const response = await fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<MaterialWithDetails>(response);
  },

  async update(
    id: string,
    data: UpdateMaterialData,
    token: string
  ): Promise<MaterialWithDetails> {
    const response = await fetch(`${API_URL}/materials/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<MaterialWithDetails>(response);
  },

  async delete(id: string, token: string): Promise<MaterialWithDetails> {
    const response = await fetch(`${API_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MaterialWithDetails>(response);
  },
};
