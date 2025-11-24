'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/shared/StatsCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  FileText,
  Package,
  TrendingUp,
  Users,
  History,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usersApi } from '@/lib/api/users';
import { materialCopiesApi } from '@/lib/api/material-copies';
import { materialsApi } from '@/lib/api/materials';
import { loansApi } from '@/lib/api/loans';
import { finesApi } from '@/lib/api/fines';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  formatDistanceToNow,
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isWithinInterval,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { LoanWithDetails, User, MaterialWithDetails } from '@library/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ActivityType = 'loan' | 'return' | 'user' | 'material' | 'overdue';

interface Activity {
  id: string;
  type: ActivityType;
  date: Date;
  title: string;
  description: string;
  status: 'default' | 'secondary' | 'destructive' | 'outline';
  statusLabel: string;
}

export default function LibrarianDashboard() {
  const { token, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalActiveUsers: 0,
    totalCopies: 0,
    activeLoans: 0,
    overdueLoans: 0,
    pendingFines: 0,
    pendingFinesAmount: 0,
  });
  const [pendingActions, setPendingActions] = useState({
    overdueLoans: 0,
    soonToExpireLoans: 0,
    suspendedUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [allActivity, setAllActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>(
    'all'
  );
  const [dateFilter, setDateFilter] = useState<'all' | 'range'>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Wait for auth to finish loading before attempting to fetch
      if (authLoading) {
        return;
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch all users with pagination (max limit is 100)
        let allUsers: any[] = [];
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const usersResponse = await usersApi.getAll(
            { page: currentPage, limit: 100 },
            token
          );
          allUsers = [...allUsers, ...usersResponse.data];

          // Check if there are more pages
          hasMorePages = currentPage < usersResponse.meta.totalPages;
          currentPage++;
        }

        // Count active users (members with ACTIVE state + active librarians)
        const activeUsers = allUsers.filter((user) => {
          if (user.role === 'MEMBER') {
            return user.member?.accountState === 'ACTIVE';
          } else if (user.role === 'LIBRARIAN') {
            return user.librarian?.isActive === true;
          }
          return false;
        }).length;

        // Fetch material copies
        const copiesResponse = await materialCopiesApi.getAll({}, token);
        const totalCopies = copiesResponse.copies?.length || 0;

        // Fetch loans
        const loansResponse = await loansApi.getAll({}, token);
        const allLoans = loansResponse.loans || [];
        const activeLoans = allLoans.filter(
          (loan) => loan.status === 'ACTIVE'
        ).length;
        const overdueLoans = allLoans.filter(
          (loan) => loan.status === 'OVERDUE'
        ).length;

        // Calculate loans expiring in the next 3 days
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const soonToExpireLoans = allLoans.filter((loan) => {
          if (loan.status !== 'ACTIVE') return false;
          const dueDate = new Date(loan.dueDate);
          return dueDate > now && dueDate <= threeDaysFromNow;
        }).length;

        // Count suspended users
        const suspendedUsers = allUsers.filter((user) => {
          if (user.role === 'MEMBER') {
            return user.member?.accountState === 'SUSPENDED';
          }
          return false;
        }).length;

        // Fetch recent materials
        const materialsResponse = await materialsApi.search({}, token);
        const allMaterials = materialsResponse.materials || [];

        // Fetch fines statistics
        const finesResponse = await finesApi.getAll({}, token);
        const allFines = finesResponse.fines || [];
        const pendingFines = allFines.filter(
          (fine) => fine.status === 'PENDING'
        ).length;
        const pendingFinesAmount = allFines
          .filter((fine) => fine.status === 'PENDING')
          .reduce((sum, fine) => sum + (fine.amount - fine.paidAmount), 0);

        // Build activity list from different sources
        const activities: Activity[] = [];

        // Add loan activities
        allLoans.forEach((loan) => {
          const loanDate = new Date(loan.createdAt || loan.loanDate);
          const memberName = `${loan.member.user.firstName} ${loan.member.user.lastName}`;

          if (loan.status === 'RETURNED' && loan.returnDate) {
            activities.push({
              id: `return-${loan.id}`,
              type: 'return',
              date: new Date(loan.returnDate),
              title: 'Material devuelto',
              description: `${loan.copy.material.title} - ${memberName}`,
              status: 'secondary',
              statusLabel: 'Devuelto',
            });
          } else if (loan.status === 'OVERDUE') {
            activities.push({
              id: `overdue-${loan.id}`,
              type: 'overdue',
              date: loanDate,
              title: 'Préstamo vencido',
              description: `${loan.copy.material.title} - ${memberName}`,
              status: 'destructive',
              statusLabel: 'Vencido',
            });
          } else if (loan.status === 'ACTIVE') {
            activities.push({
              id: `loan-${loan.id}`,
              type: 'loan',
              date: loanDate,
              title: 'Nuevo préstamo registrado',
              description: `${loan.copy.material.title} - ${memberName}`,
              status: 'default',
              statusLabel: 'Activo',
            });
          }
        });

        // Add user activities (recent users)
        allUsers.slice(-10).forEach((user) => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            date: new Date(user.createdAt),
            title: 'Nuevo usuario registrado',
            description: `${user.firstName} ${user.lastName} - ${
              user.role === 'MEMBER' ? 'Miembro' : 'Bibliotecario'
            }`,
            status: 'outline',
            statusLabel: user.role === 'MEMBER' ? 'Miembro' : 'Bibliotecario',
          });
        });

        // Add material activities (recent materials)
        allMaterials.slice(-10).forEach((material) => {
          activities.push({
            id: `material-${material.id}`,
            type: 'material',
            date: new Date(material.createdAt),
            title: 'Nuevo material agregado',
            description: material.title,
            status: 'outline',
            statusLabel: 'Material',
          });
        });

        // Sort all activities by date
        const sortedActivities = activities.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );

        setStats({
          totalActiveUsers: activeUsers,
          totalCopies,
          activeLoans,
          overdueLoans,
          pendingFines,
          pendingFinesAmount,
        });
        setPendingActions({
          overdueLoans,
          soonToExpireLoans,
          suspendedUsers,
        });
        setRecentActivity(sortedActivities.slice(0, 5));
        setAllActivity(sortedActivities);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token, authLoading]);

  const filteredActivity = allActivity.filter((activity) => {
    // Filter by type
    if (activityFilter !== 'all' && activity.type !== activityFilter) {
      return false;
    }

    // Filter by date range
    if (dateFilter === 'range' && dateRange.from) {
      const rangeStart = startOfDay(dateRange.from);
      const rangeEnd = dateRange.to
        ? endOfDay(dateRange.to)
        : endOfDay(dateRange.from);
      return isWithinInterval(activity.date, {
        start: rangeStart,
        end: rangeEnd,
      });
    }

    return true;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'loan':
        return <FileText className="h-4 w-4" />;
      case 'return':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'material':
        return <Package className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al sistema de gestión bibliotecaria
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Usuarios activos"
          value={isLoading ? '...' : stats.totalActiveUsers}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Total de copias"
          value={isLoading ? '...' : stats.totalCopies}
          icon={Package}
          variant="success"
        />
        <StatsCard
          title="Préstamos activos"
          value={isLoading ? '...' : stats.activeLoans}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Préstamos vencidos"
          value={isLoading ? '...' : stats.overdueLoans}
          icon={AlertCircle}
          variant="danger"
          trend={
            isLoading
              ? undefined
              : stats.overdueLoans > 0
              ? { value: 'Requiere atención', isPositive: false }
              : undefined
          }
        />
      </div>

      {/* Fines Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Multas pendientes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {isLoading ? '...' : stats.pendingFines}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? '' : `${stats.pendingFines} multas sin pagar`}
            </p>
            <Link href="/dashboard/librarian/fines">
              <Button variant="link" className="mt-2 p-0 h-auto">
                Ver todas las multas →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monto pendiente de multas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {isLoading ? '...' : `$${stats.pendingFinesAmount.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? '' : 'Total por cobrar'}
            </p>
            <Link href="/dashboard/librarian/fines">
              <Button variant="link" className="mt-2 p-0 h-auto">
                Gestionar pagos →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Últimas 5 acciones registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Cargando actividad reciente...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const isLast = index === recentActivity.length - 1;

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start justify-between ${
                        !isLast ? 'border-b pb-3' : 'pb-3'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.date, {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                      <Badge variant={activity.status}>
                        {activity.statusLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4">
                  <History className="mr-2 h-4 w-4" />
                  Ver toda la actividad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Actividad completa del sistema</DialogTitle>
                  <DialogDescription>
                    Historial completo de todas las acciones registradas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Tipo de actividad</Label>
                        <Select
                          value={activityFilter}
                          onValueChange={(value) =>
                            setActivityFilter(value as ActivityType | 'all')
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="loan">Préstamos</SelectItem>
                            <SelectItem value="return">Devoluciones</SelectItem>
                            <SelectItem value="overdue">Vencidos</SelectItem>
                            <SelectItem value="user">Usuarios</SelectItem>
                            <SelectItem value="material">Materiales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Período</Label>
                        <Select
                          value={dateFilter}
                          onValueChange={(value) => {
                            setDateFilter(value as 'all' | 'range');
                            if (value === 'all') {
                              setDateRange({ from: undefined, to: undefined });
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por fecha" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todo el tiempo</SelectItem>
                            <SelectItem value="range">
                              Rango de fechas
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {dateFilter === 'range' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Rango de fechas (selecciona entre meses
                            consecutivos)
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-80 justify-start text-left font-normal',
                                  !dateRange.from && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                  dateRange.to ? (
                                    <>
                                      {format(dateRange.from, "d 'de' MMM", {
                                        locale: es,
                                      })}{' '}
                                      -{' '}
                                      {format(
                                        dateRange.to,
                                        "d 'de' MMM 'de' yyyy",
                                        { locale: es }
                                      )}
                                    </>
                                  ) : (
                                    format(
                                      dateRange.from,
                                      "d 'de' MMMM 'de' yyyy",
                                      { locale: es }
                                    )
                                  )
                                ) : (
                                  <span>Selecciona un rango de fechas</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={(range) => {
                                  setDateRange({
                                    from: range?.from,
                                    to: range?.to,
                                  });
                                }}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date('1900-01-01')
                                }
                                defaultMonth={dateRange.from || new Date()}
                                initialFocus
                                locale={es}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {filteredActivity.length}{' '}
                        {filteredActivity.length === 1
                          ? 'actividad'
                          : 'actividades'}
                      </p>
                      {(dateFilter !== 'all' || activityFilter !== 'all') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActivityFilter('all');
                            setDateFilter('all');
                            setDateRange({ from: undefined, to: undefined });
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {filteredActivity.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No hay actividades que coincidan con el filtro</p>
                      </div>
                    ) : (
                      filteredActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="mt-0.5">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-none">
                                {activity.title}
                              </p>
                              <Badge
                                variant={activity.status}
                                className="shrink-0"
                              >
                                {activity.statusLabel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                activity.date,
                                "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                                {
                                  locale: es,
                                }
                              )}{' '}
                              (
                              {formatDistanceToNow(activity.date, {
                                addSuffix: true,
                                locale: es,
                              })}
                              )
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones pendientes</CardTitle>
            <CardDescription>Tareas que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Cargando acciones pendientes...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingActions.overdueLoans > 0 && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {pendingActions.overdueLoans}{' '}
                        {pendingActions.overdueLoans === 1
                          ? 'préstamo vencido'
                          : 'préstamos vencidos'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requieren gestión inmediata
                      </p>
                    </div>
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgente
                    </Badge>
                  </div>
                )}

                {pendingActions.soonToExpireLoans > 0 && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {pendingActions.soonToExpireLoans}{' '}
                        {pendingActions.soonToExpireLoans === 1
                          ? 'préstamo por vencer'
                          : 'préstamos por vencer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vencen en los próximos 3 días
                      </p>
                    </div>
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      Por vencer
                    </Badge>
                  </div>
                )}

                {pendingActions.suspendedUsers > 0 && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {pendingActions.suspendedUsers}{' '}
                        {pendingActions.suspendedUsers === 1
                          ? 'usuario suspendido'
                          : 'usuarios suspendidos'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Por multas o incumplimientos
                      </p>
                    </div>
                    <Badge variant="outline">Revisión</Badge>
                  </div>
                )}

                {pendingActions.overdueLoans === 0 &&
                  pendingActions.soonToExpireLoans === 0 &&
                  pendingActions.suspendedUsers === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">
                        ✅ No hay acciones pendientes en este momento
                      </p>
                      <p className="text-xs mt-1">
                        Todo está funcionando correctamente
                      </p>
                    </div>
                  )}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/librarian/loans">
                Ver todos los préstamos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones más usadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/librarian/users">
                <Users className="mr-2 h-4 w-4" />
                Gestionar usuarios
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/librarian/materials">
                <Package className="mr-2 h-4 w-4" />
                Gestionar materiales
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/librarian/loans">
                <FileText className="mr-2 h-4 w-4" />
                Gestionar prestamos
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/librarian/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver reportes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
