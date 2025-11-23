'use client';

import { useState } from 'react';
import { BookOpen, Calendar, Clock, Heart } from 'lucide-react';
import MemberStatsCard from '@/components/member/MemberStatsCard';
import LoanCard from '@/components/member/LoanCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmptyState from '@/components/member/EmptyState';

export default function MemberDashboardPage() {
  // Mock data - replace with real API calls
  const [stats] = useState({
    activeLoans: 3,
    dueSoon: 1,
    pendingReservations: 2,
    totalBorrowed: 15,
  });

  const [activeLoans] = useState([
    {
      id: 1,
      material: {
        title: 'Clean Code',
        type: 'Libro',
        author: 'Robert C. Martin',
      },
      loanDate: new Date('2024-01-10'),
      returnDate: new Date('2024-01-24'),
      status: 'active' as const,
    },
    {
      id: 2,
      material: {
        title: 'El Quijote',
        type: 'Libro',
        author: 'Miguel de Cervantes',
      },
      loanDate: new Date('2024-01-15'),
      returnDate: new Date('2024-01-22'),
      status: 'due_soon' as const,
    },
  ]);

  const [overdueLoan] = useState({
    id: 3,
    material: {
      title: 'JavaScript: The Good Parts',
      type: 'Libro',
      author: 'Douglas Crockford',
    },
    loanDate: new Date('2024-01-01'),
    returnDate: new Date('2024-01-18'),
    status: 'overdue' as const,
  });

  const hasOverdueLoans = !!overdueLoan;

  const handleRenewLoan = (id: number) => {
    console.log('Renovar préstamo:', id);
    // Implement renewal logic
  };

  const handleViewDetails = (id: number) => {
    console.log('Ver detalles préstamo:', id);
    // Implement view details logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bienvenido</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus prestamos y reservas de materiales
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MemberStatsCard
          title="Prestamos activos"
          value={stats.activeLoans}
          icon={BookOpen}
          description="Materiales en tu poder"
          link="/dashboard/member/loans"
          linkText="Ver todos"
          variant="info"
        />
        <MemberStatsCard
          title="Por vencer"
          value={stats.dueSoon}
          icon={Clock}
          description="Devolver pronto"
          variant="warning"
          attention={stats.dueSoon > 0}
        />
        <MemberStatsCard
          title="Reservas pendientes"
          value={stats.pendingReservations}
          icon={Calendar}
          description="Esperando disponibilidad"
          link="/dashboard/member/reservations"
          linkText="Ver reservas"
        />
        <MemberStatsCard
          title="Total prestados"
          value={stats.totalBorrowed}
          icon={Heart}
          description="Histórico de materiales"
          variant="success"
        />
      </div>

      {/* Alerts */}
      {hasOverdueLoans && (
        <Alert variant="destructive">
          <AlertDescription>
            Tienes prestamos vencidos. Por favor, devuélvelos lo antes posible
            para evitar sanciones.
          </AlertDescription>
        </Alert>
      )}

      {stats.dueSoon > 0 && !hasOverdueLoans && (
        <Alert className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Tienes {stats.dueSoon}{' '}
            {stats.dueSoon === 1 ? 'préstamo' : 'prestamos'} que vencen pronto.
            Considera renovarlos o devolverlos a tiempo.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Loans Section */}
      <Card>
        <CardHeader>
          <CardTitle>Prestamos activos</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoans.length > 0 ? (
            <div className="space-y-4">
              {hasOverdueLoans && (
                <LoanCard
                  {...overdueLoan}
                  onRenew={handleRenewLoan}
                  onViewDetails={handleViewDetails}
                />
              )}
              {activeLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  {...loan}
                  onRenew={handleRenewLoan}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="loans" />
          )}
        </CardContent>
      </Card>

      {/* Available Reservations */}
      {stats.pendingReservations > 0 && (
        <Alert className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <AlertDescription className="text-green-800 dark:text-green-200">
            Tienes {stats.pendingReservations}{' '}
            {stats.pendingReservations === 1
              ? 'reserva lista'
              : 'reservas listas'}{' '}
            para recoger. Visita la sección de reservas para más detalles.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
