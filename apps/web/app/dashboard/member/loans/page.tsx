'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loansApi } from '@/lib/api/loans';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Loader2,
  BookOpen,
  Clock,
  RefreshCw,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { LoanWithDetails, LoanStatus, MemberLoanStats } from '@library/types';

const statusLabels: Record<LoanStatus, string> = {
  ACTIVE: 'Activo',
  RETURNED: 'Devuelto',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
};

const statusColors: Record<
  LoanStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  RETURNED: 'secondary',
  OVERDUE: 'destructive',
  CANCELLED: 'outline',
};

export default function MemberLoansPage() {
  const { token, user } = useAuth();
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [stats, setStats] = useState<MemberLoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (token && user) {
      fetchLoans();
      fetchStats();
    }
  }, [token, user]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loansApi.getAll({ pageSize: 100 }, token!);
      console.log('Página Loans - Todos los préstamos:', response);
      console.log(
        'Página Loans - Préstamos activos filtrados:',
        response.loans.filter((l) => l.status === 'ACTIVE' && !l.returnDate)
      );
      setLoans(response.loans);
    } catch (error: any) {
      toast.error('Error al cargar préstamos', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      setLoadingStats(true);
      const memberStats = await loansApi.getMemberStats(user.id, token!);
      setStats(memberStats);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas', {
        description: error.message,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    try {
      await loansApi.renewLoan(loanId, token!);
      toast.success('Préstamo renovado exitosamente');
      fetchLoans();
      fetchStats();
    } catch (error: any) {
      toast.error('Error al renovar préstamo', {
        description: error.message,
      });
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const daysUntilDue = (dueDate: string) => {
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLoans = loans.filter((loan) => {
    // Incluir préstamos activos y aquellos que aún no han sido devueltos
    return loan.status === 'ACTIVE' && !loan.returnDate;
  });

  const pastLoans = loans.filter(
    (loan) => loan.status === 'RETURNED' || loan.status === 'CANCELLED'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis préstamos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus préstamos de materiales
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Préstamos activos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLoans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Préstamos vencidos
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.overdueLoans}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Multas totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalFines.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Multas pendientes
              </CardTitle>
              <DollarSign className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${stats.unpaidFines.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Préstamos activos</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes préstamos activos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Fecha préstamo</TableHead>
                  <TableHead>Fecha vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Renovaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLoans.map((loan) => {
                  const daysLeft = daysUntilDue(loan.dueDate);
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">
                        {loan.copy.material.title}
                      </TableCell>
                      <TableCell>
                        {format(new Date(loan.loanDate), 'dd MMM yyyy', {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {format(new Date(loan.dueDate), 'dd MMM yyyy', {
                            locale: es,
                          })}
                          {loan.status === 'ACTIVE' && (
                            <span
                              className={`text-xs ${
                                daysLeft <= 3
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              ({daysLeft > 0 ? `${daysLeft} días` : 'Vencido'})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[loan.status]}>
                          {statusLabels[loan.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{loan.renewalCount}</TableCell>
                      <TableCell className="text-right">
                        {loan.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenewLoan(loan.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Renovar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Past Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          {pastLoans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes historial de préstamos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Fecha préstamo</TableHead>
                  <TableHead>Fecha devolución</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      {loan.copy.material.title}
                    </TableCell>
                    <TableCell>
                      {format(new Date(loan.loanDate), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {loan.returnDate
                        ? format(new Date(loan.returnDate), 'dd MMM yyyy', {
                            locale: es,
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[loan.status]}>
                        {statusLabels[loan.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
