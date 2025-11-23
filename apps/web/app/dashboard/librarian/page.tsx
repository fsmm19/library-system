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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LibrarianDashboard() {
  const { token, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalActiveUsers: 0,
    totalMaterials: 856, // TODO: Replace with real materials API
    activeLoans: 45, // TODO: Replace with real loans API
    overdueLoans: 8, // TODO: Replace with real loans API
  });
  const [isLoading, setIsLoading] = useState(true);

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
          const usersResponse = await usersApi.getAll(token, currentPage, 100);
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

        setStats((prev) => ({
          ...prev,
          totalActiveUsers: activeUsers,
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Error al cargar estadísticas de usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token, authLoading]);

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
          trend={
            isLoading
              ? undefined
              : { value: 'Datos en tiempo real', isPositive: true }
          }
        />
        <StatsCard
          title="Total de materiales"
          value={stats.totalMaterials}
          icon={Package}
          variant="success"
        />
        <StatsCard
          title="Prestamos activos"
          value={stats.activeLoans}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Prestamos vencidos"
          value={stats.overdueLoans}
          icon={AlertCircle}
          variant="danger"
          trend={{ value: 'Requiere atención', isPositive: false }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Ultimas acciones registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nuevo préstamo registrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cien anos de soledad - Juan Perez
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hace 5 minutos
                  </p>
                </div>
                <Badge>Activo</Badge>
              </div>

              <div className="flex items-start justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Material devuelto
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Don Quijote de la Mancha - Maria Garcia
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
                <Badge variant="secondary">Devuelto</Badge>
              </div>

              <div className="flex items-start justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nuevo usuario registrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Carlos Rodriguez
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
                <Badge variant="outline">Usuario</Badge>
              </div>

              <div className="flex items-start justify-between pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Préstamo vencido
                  </p>
                  <p className="text-sm text-muted-foreground">
                    El principito - Ana Martinez
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 3 horas</p>
                </div>
                <Badge variant="destructive">Vencido</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/librarian/loans">
                Ver todos los prestamos
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones pendientes</CardTitle>
            <CardDescription>Tareas que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    8 prestamos vencidos
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

              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    12 prestamos por vencer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vencen en los próximos 3 días
                  </p>
                </div>
                <Badge className="bg-amber-500 hover:bg-amber-600">
                  Por vencer
                </Badge>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    3 usuarios suspendidos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Por multas pendientes
                  </p>
                </div>
                <Badge variant="outline">Revision</Badge>
              </div>

              <div className="flex items-center justify-between pb-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    5 materiales bajo stock
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Considerar adquisición
                  </p>
                </div>
                <Badge variant="secondary">Info</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/librarian/reports">Ver reportes</Link>
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
