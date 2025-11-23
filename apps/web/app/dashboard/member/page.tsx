'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Heart, Loader2 } from 'lucide-react';
import MemberStatsCard from '@/components/member/MemberStatsCard';
import LoanCard from '@/components/member/LoanCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmptyState from '@/components/member/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { loansApi } from '@/lib/api/loans';
import { reservationsApi } from '@/lib/api/reservations';
import { LoanWithDetails } from '@library/types';
import { toast } from 'sonner';

export default function MemberDashboardPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeLoans: 0,
    overdueLoans: 0,
    dueSoon: 0,
    readyForPickup: 0,
    totalBorrowed: 0,
  });

  const [activeLoans, setActiveLoans] = useState<LoanWithDetails[]>([]);
  const [dueSoonLoans, setDueSoonLoans] = useState<LoanWithDetails[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<LoanWithDetails[]>([]);

  useEffect(() => {
    if (token && user) {
      fetchData();
    }
  }, [token, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch loan stats and reservations stats
      const [loanStats, reservationStats, loansResponse] = await Promise.all([
        loansApi.getMemberStats(user!.id, token!),
        reservationsApi.getMemberStats(user!.id, token!),
        loansApi.getAll({ pageSize: 100 }, token!),
      ]);

      // Filter only active loans (not returned)
      const activeOnlyLoans = loansResponse.loans.filter(
        (loan) => loan.status === 'ACTIVE' && !loan.returnDate
      );

      // Count loans due within 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const now = new Date();

      const overdue = activeOnlyLoans.filter(
        (loan) => new Date(loan.dueDate) < now
      );

      const dueSoon = activeOnlyLoans.filter((loan) => {
        const dueDate = new Date(loan.dueDate);
        return dueDate >= now && dueDate <= threeDaysFromNow;
      });

      const active = activeOnlyLoans.filter((loan) => {
        const dueDate = new Date(loan.dueDate);
        return dueDate > threeDaysFromNow;
      });

      console.log('Dashboard Home - Todos los préstamos:', loansResponse.loans);
      console.log(
        'Dashboard Home - Préstamos activos solamente:',
        activeOnlyLoans
      );
      console.log('Dashboard Home - Vencidos:', overdue);
      console.log('Dashboard Home - Por vencer:', dueSoon);
      console.log('Dashboard Home - Activos (>3 días):', active);

      setStats({
        activeLoans: loanStats.activeLoans,
        overdueLoans: loanStats.overdueLoans,
        dueSoon: dueSoon.length,
        readyForPickup: reservationStats.readyForPickup,
        totalBorrowed: loansResponse.total,
      });

      setActiveLoans(active);
      setDueSoonLoans(dueSoon);
      setOverdueLoans(overdue);
    } catch (error: any) {
      toast.error('Error al cargar datos', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasOverdueLoans = overdueLoans.length > 0;

  const handleRenewLoan = async (id: string) => {
    try {
      await loansApi.renewLoan(id, token!);
      toast.success('Préstamo renovado exitosamente');
      fetchData();
    } catch (error: any) {
      toast.error('Error al renovar préstamo', {
        description: error.message,
      });
    }
  };

  const handleViewDetails = (id: string) => {
    window.location.href = `/dashboard/member/loans`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          title="Préstamos activos"
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
          title="Listas para recoger"
          value={stats.readyForPickup}
          icon={Calendar}
          description="Reservas disponibles"
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
          <CardTitle>Préstamos activos</CardTitle>
        </CardHeader>
        <CardContent>
          {overdueLoans.length > 0 ||
          dueSoonLoans.length > 0 ||
          activeLoans.length > 0 ? (
            <div className="space-y-4">
              {overdueLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  status="overdue"
                  onRenew={handleRenewLoan}
                  onViewDetails={handleViewDetails}
                />
              ))}
              {dueSoonLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  status="due_soon"
                  onRenew={handleRenewLoan}
                  onViewDetails={handleViewDetails}
                />
              ))}
              {activeLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  status="active"
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
      {stats.readyForPickup > 0 && (
        <Alert className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <AlertDescription className="text-green-800 dark:text-green-200">
            Tienes {stats.readyForPickup}{' '}
            {stats.readyForPickup === 1 ? 'reserva lista' : 'reservas listas'}{' '}
            para recoger. Visita la sección de reservas para más detalles.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
