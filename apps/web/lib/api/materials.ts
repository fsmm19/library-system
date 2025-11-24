import {
  MaterialWithDetails,
  CreateMaterialData,
  UpdateMaterialData,
  SearchMaterialsParams,
  SearchMaterialsResponse,
  Author,
  Category,
  Country,
  Publisher,
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
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach((c) => queryParams.append('categories', c));
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

  async updateAuthor(
    id: string,
    data: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      countryOfOriginId?: string;
      birthDate?: string;
    },
    token: string
  ): Promise<Author> {
    const response = await fetch(`${API_URL}/materials/authors/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Author>(response);
  },

  async deleteAuthor(id: string, token: string): Promise<Author> {
    const response = await fetch(`${API_URL}/materials/authors/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Author>(response);
  },

  async getAllCategories(token?: string): Promise<Category[]> {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/materials/categories`, {
      headers,
    });
    return handleResponse<Category[]>(response);
  },

  async getAllCountries(token: string): Promise<Country[]> {
    const response = await fetch(`${API_URL}/materials/countries`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Country[]>(response);
  },

  async getAllPublishers(token: string): Promise<Publisher[]> {
    const response = await fetch(`${API_URL}/materials/publishers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Publisher[]>(response);
  },

  // Categories CRUD
  async createCategory(
    data: { name: string },
    token: string
  ): Promise<Category> {
    const response = await fetch(`${API_URL}/materials/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  async updateCategory(
    id: string,
    data: { name: string },
    token: string
  ): Promise<Category> {
    const response = await fetch(`${API_URL}/materials/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  async deleteCategory(id: string, token: string): Promise<Category> {
    const response = await fetch(`${API_URL}/materials/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Category>(response);
  },

  // Countries CRUD
  async createCountry(data: { name: string }, token: string): Promise<Country> {
    const response = await fetch(`${API_URL}/materials/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Country>(response);
  },

  async updateCountry(
    id: string,
    data: { name: string },
    token: string
  ): Promise<Country> {
    const response = await fetch(`${API_URL}/materials/countries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Country>(response);
  },

  async deleteCountry(id: string, token: string): Promise<Country> {
    const response = await fetch(`${API_URL}/materials/countries/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Country>(response);
  },

  // Publishers CRUD
  async createPublisher(
    data: { name: string },
    token: string
  ): Promise<Publisher> {
    const response = await fetch(`${API_URL}/materials/publishers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Publisher>(response);
  },

  async updatePublisher(
    id: string,
    data: { name: string },
    token: string
  ): Promise<Publisher> {
    const response = await fetch(`${API_URL}/materials/publishers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Publisher>(response);
  },

  async deletePublisher(id: string, token: string): Promise<Publisher> {
    const response = await fetch(`${API_URL}/materials/publishers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<Publisher>(response);
  },
};
