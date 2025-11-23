import {
  MaterialWithDetails,
  CreateMaterialData,
  UpdateMaterialData,
  SearchMaterialsParams,
  SearchMaterialsResponse,
  Author,
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

    // NestJS error format: { statusCode, message, error }
    const message = errorData.message || errorData.error || 'An error occurred';
    const errors = errorData.errors;

    throw new MaterialsApiError(
      Array.isArray(message) ? message[0] : message,
      response.status,
      errors
    );
  }
  return response.json();
}

export const materialsApi = {
  async search(
    params: SearchMaterialsParams,
    token?: string
  ): Promise<SearchMaterialsResponse> {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.types && params.types.length > 0) {
      params.types.forEach((t) => queryParams.append('types', t));
    }
    if (params.languages && params.languages.length > 0) {
      params.languages.forEach((l) => queryParams.append('languages', l));
    }
    if (params.authorName) queryParams.append('authorName', params.authorName);
    if (params.yearFrom)
      queryParams.append('yearFrom', params.yearFrom.toString());
    if (params.yearTo) queryParams.append('yearTo', params.yearTo.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize)
      queryParams.append('pageSize', params.pageSize.toString());

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}/materials?${queryParams.toString()}`,
      {
        headers,
      }
    );
    return handleResponse<SearchMaterialsResponse>(response);
  },

  async getById(id: string, token?: string): Promise<MaterialWithDetails> {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/materials/${id}`, {
      headers,
    });
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

  async getAllAuthors(token: string): Promise<Author[]> {
    const response = await fetch(`${API_URL}/materials/authors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Author[]>(response);
  },
};
