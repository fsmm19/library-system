'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { reservationsApi } from '@/lib/api/reservations';
import { ReservationWithDetails } from '@library/types';

interface ReservationsContextType {
  activeReservations: Set<string>; // Set de materialIds
  isLoading: boolean;
  refreshReservations: () => Promise<void>;
  addReservation: (materialId: string) => void;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(
  undefined
);

export function ReservationsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [activeReservations, setActiveReservations] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservations = async () => {
    if (!user || !token) {
      setActiveReservations(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const response = await reservationsApi.getAll({}, token);

      // Filtrar solo reservas activas (PENDING o READY) y extraer materialIds
      const activeMaterialIds = response.reservations
        .filter((res) => res.status === 'PENDING' || res.status === 'READY')
        .map((res) => res.materialId);

      setActiveReservations(new Set(activeMaterialIds));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setActiveReservations(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user, token]);

  const refreshReservations = async () => {
    await fetchReservations();
  };

  const addReservation = (materialId: string) => {
    setActiveReservations((prev) => new Set([...prev, materialId]));
  };

  return (
    <ReservationsContext.Provider
      value={{
        activeReservations,
        isLoading,
        refreshReservations,
        addReservation,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error(
      'useReservations must be used within a ReservationsProvider'
    );
  }
  return context;
}
