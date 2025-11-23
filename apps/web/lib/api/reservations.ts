import {
  ReservationWithDetails,
  CreateReservationData,
  GetReservationsParams,
  GetReservationsResponse,
  UpdateReservationStatusData,
  MemberReservationStats,
} from '@library/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ReservationsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ReservationsApiError';
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

    throw new ReservationsApiError(
      Array.isArray(message) ? message[0] : message,
      response.status,
      errors
    );
  }
  return response.json();
}

export const reservationsApi = {
  async getAll(
    params: GetReservationsParams,
    token: string
  ): Promise<GetReservationsResponse> {
    const queryParams = new URLSearchParams();

    if (params.memberId) queryParams.append('memberId', params.memberId);
    if (params.materialId) queryParams.append('materialId', params.materialId);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize)
      queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(
      `${API_URL}/reservations?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return handleResponse<GetReservationsResponse>(response);
  },

  async getById(id: string, token: string): Promise<ReservationWithDetails> {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<ReservationWithDetails>(response);
  },

  async create(
    data: CreateReservationData,
    token: string
  ): Promise<ReservationWithDetails> {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ReservationWithDetails>(response);
  },

  async updateStatus(
    reservationId: string,
    data: UpdateReservationStatusData,
    token: string
  ): Promise<ReservationWithDetails> {
    const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ReservationWithDetails>(response);
  },

  async confirmPickup(
    reservationId: string,
    token: string
  ): Promise<ReservationWithDetails> {
    const response = await fetch(
      `${API_URL}/reservations/${reservationId}/confirm-pickup`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return handleResponse<ReservationWithDetails>(response);
  },

  async cancel(
    reservationId: string,
    token: string
  ): Promise<ReservationWithDetails> {
    const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<ReservationWithDetails>(response);
  },

  async getMemberStats(
    memberId: string,
    token: string
  ): Promise<MemberReservationStats> {
    const response = await fetch(`${API_URL}/reservations/stats/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<MemberReservationStats>(response);
  },

  async updateExpiredReservations(
    token: string
  ): Promise<{ updated: number; reservationIds: string[] }> {
    const response = await fetch(`${API_URL}/reservations/update-expired`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<{ updated: number; reservationIds: string[] }>(
      response
    );
  },
};
