'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import ReservationCard from '@/components/member/ReservationCard';
import EmptyState from '@/components/member/EmptyState';

export default function MemberReservationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real API calls
  const [activeReservations] = useState([
    {
      id: 1,
      material: {
        title: 'Refactoring',
        type: 'Libro',
        author: 'Martin Fowler',
      },
      reservationDate: new Date('2024-01-15'),
      expirationDate: new Date('2024-01-25'),
      status: 'ready' as const,
      queuePosition: undefined,
    },
    {
      id: 2,
      material: {
        title: 'Domain-Driven Design',
        type: 'Libro',
        author: 'Eric Evans',
      },
      reservationDate: new Date('2024-01-10'),
      expirationDate: new Date('2024-02-10'),
      status: 'active' as const,
      queuePosition: 3,
    },
  ]);

  const [reservationHistory] = useState([
    {
      id: 3,
      material: {
        title: 'The Art of Computer Programming',
        type: 'Libro',
        author: 'Donald Knuth',
      },
      reservationDate: new Date('2023-12-01'),
      expirationDate: new Date('2023-12-15'),
      status: 'expired' as const,
    },
  ]);

  const handlePickup = (id: number) => {
    console.log('Recoger reserva:', id);
    // Implement pickup logic
  };

  const handleCancel = (id: number) => {
    console.log('Cancelar reserva:', id);
    // Implement cancel logic
  };

  const filteredActive = activeReservations.filter((reservation) =>
    reservation.material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = reservationHistory.filter((reservation) =>
    reservation.material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Reservas</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus reservas de materiales
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Reservas activas ({activeReservations.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Historial ({reservationHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredActive.length > 0 ? (
            filteredActive.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                {...reservation}
                variant="expanded"
                onPickup={handlePickup}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <EmptyState type="reservations" />
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                {...reservation}
                variant="expanded"
              />
            ))
          ) : (
            <EmptyState type="history" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
