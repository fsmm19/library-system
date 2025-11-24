import {
  LoanWithDetails,
  CreateLoanData,
  GetLoansParams,
  GetLoansResponse,
  MemberLoanStats,
  LoanConfiguration,
  UpdateLoanConfigurationData,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class LoansApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'LoansApiError';
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

    throw new LoansApiError(
      Array.isArray(message) ? message[0] : message,
      response.status,
      errors
    );
  }
  return response.json();
}

export const loansApi = {
  async getAll(
    params: GetLoansParams,
    token: string
  ): Promise<GetLoansResponse> {
    const queryParams = new URLSearchParams();

    if (params.memberId) queryParams.append('memberId', params.memberId);
    if (params.status) queryParams.append('status', params.status);
    if (params.overdue !== undefined)
      queryParams.append('overdue', params.overdue.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize)
      queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_URL}/loans?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<GetLoansResponse>(response);
  },

  async getById(id: string, token: string): Promise<LoanWithDetails> {
    const response = await fetch(`${API_URL}/loans/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<LoanWithDetails>(response);
  },

  async create(data: CreateLoanData, token: string): Promise<LoanWithDetails> {
    const response = await fetch(`${API_URL}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<LoanWithDetails>(response);
  },

  async returnLoan(
    loanId: string,
    returnDate: string | undefined,
    token: string,
    condition?: string
  ): Promise<LoanWithDetails> {
    const response = await fetch(`${API_URL}/loans/${loanId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ returnDate, condition }),
    });
    return handleResponse<LoanWithDetails>(response);
  },

  async renewLoan(loanId: string, token: string): Promise<LoanWithDetails> {
    const response = await fetch(`${API_URL}/loans/${loanId}/renew`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<LoanWithDetails>(response);
  },

  async getMemberStats(
    memberId: string,
    token: string
  ): Promise<MemberLoanStats> {
    const response = await fetch(`${API_URL}/loans/stats/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MemberLoanStats>(response);
  },

  async updateOverdueLoans(
    token: string
  ): Promise<{ updated: number; loanIds: string[] }> {
    const response = await fetch(`${API_URL}/loans/update-overdue`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<{ updated: number; loanIds: string[] }>(response);
  },

  async getConfiguration(token: string): Promise<LoanConfiguration> {
    const response = await fetch(`${API_URL}/loan-configuration`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<LoanConfiguration>(response);
  },

  async updateConfiguration(
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
