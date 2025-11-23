import {
  LoanConfiguration,
  UpdateLoanConfigurationData,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class LoanConfigApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'LoanConfigApiError';
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

    throw new LoanConfigApiError(
      Array.isArray(message) ? message[0] : message,
      response.status,
      errors
    );
  }
  return response.json();
}

export const loanConfigApi = {
  async get(token: string): Promise<LoanConfiguration> {
    const response = await fetch(`${API_URL}/loan-configuration`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<LoanConfiguration>(response);
  },

  async update(
    data: UpdateLoanConfigurationData,
    token: string
  ): Promise<LoanConfiguration> {
    const response = await fetch(`${API_URL}/loan-configuration`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<LoanConfiguration>(response);
  },
};
