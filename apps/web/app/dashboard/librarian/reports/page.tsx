'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
  Package,
  FileText,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api/users';
import { materialsApi } from '@/lib/api/materials';
import { loansApi } from '@/lib/api/loans';
import { materialCopiesApi } from '@/lib/api/material-copies';
import { finesApi } from '@/lib/api/fines';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyStats {
  month: string;
  loans: number;
  returns: number;
  newUsers: number;
  newMaterials: number;
}

export default function ReportsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMembers: 0,
    suspendedMembers: 0,
    totalMaterials: 0,
    totalCopies: 0,
    availableCopies: 0,
    borrowedCopies: 0,
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    returnedLoans: 0,
    averageLoanDuration: 0,
    totalFines: 0,
    pendingFines: 0,
    paidFines: 0,
    cancelledFines: 0,
    waivedFines: 0,
    totalFinesAmount: 0,
    pendingFinesAmount: 0,
    paidFinesAmount: 0,
  });
  const [materialsByType, setMaterialsByType] = useState<
    { type: string; count: number; percentage: number }[]
  >([]);
  const [topBorrowedMaterials, setTopBorrowedMaterials] = useState<
    { id: string; title: string; loans: number }[]
  >([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (authLoading) return;
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch all users with pagination
        const fetchAllUsers = async () => {
          let allUsers: any[] = [];
          let currentPage = 1;
          let hasMore = true;

          while (hasMore) {
            const response = await usersApi.getAll(
              { page: currentPage, limit: 100 },
              token
            );
            allUsers = [...allUsers, ...(response.data || [])];
            hasMore = currentPage < response.meta.totalPages;
            currentPage++;
          }

          return allUsers;
        };

        // Fetch all data
        const [
          allUsers,
          materialsResponse,
          loansResponse,
          copiesResponse,
          finesResponse,
        ] = await Promise.all([
          fetchAllUsers(),
          materialsApi.search({}, token),
          loansApi.getAll({}, token),
          materialCopiesApi.getAll({}, token),
          finesApi.getAll({}, token),
        ]);

        const allMaterials = materialsResponse.materials || [];
        const allLoans = loansResponse.loans || [];
        const allCopies = copiesResponse.copies || [];
        const allFines = finesResponse.fines || [];

        // User statistics
        const totalUsers = allUsers.length;
        const activeMembers = allUsers.filter(
          (u) => u.role === 'MEMBER' && u.member?.accountState === 'ACTIVE'
        ).length;
        const suspendedMembers = allUsers.filter(
          (u) => u.role === 'MEMBER' && u.member?.accountState === 'SUSPENDED'
        ).length;

        // Material statistics
        const totalMaterials = allMaterials.length;
        const totalCopies = allCopies.length;
        const availableCopies = allCopies.filter(
          (c) => c.status === 'AVAILABLE'
        ).length;
        const borrowedCopies = allCopies.filter(
          (c) => c.status === 'BORROWED'
        ).length;

        // Loan statistics
        const totalLoans = allLoans.length;
        const activeLoans = allLoans.filter(
          (l) => l.status === 'ACTIVE'
        ).length;
        const overdueLoans = allLoans.filter(
          (l) => l.status === 'OVERDUE'
        ).length;
        const returnedLoans = allLoans.filter(
          (l) => l.status === 'RETURNED'
        ).length;

        // Calculate average loan duration
        const returnedLoansWithDates = allLoans.filter(
          (l) => l.status === 'RETURNED' && l.returnDate && l.loanDate
        );
        const totalDuration = returnedLoansWithDates.reduce((sum, loan) => {
          const loanDate = new Date(loan.loanDate);
          const returnDate = new Date(loan.returnDate!);
          const duration = Math.floor(
            (returnDate.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + duration;
        }, 0);
        const averageLoanDuration =
          returnedLoansWithDates.length > 0
            ? Math.round(totalDuration / returnedLoansWithDates.length)
            : 0;

        // Fines statistics
        const totalFines = allFines.length;
        const pendingFines = allFines.filter(
          (f) => f.status === 'PENDING'
        ).length;
        const paidFines = allFines.filter((f) => f.status === 'PAID').length;
        const cancelledFines = allFines.filter(
          (f) => f.status === 'CANCELLED'
        ).length;
        const waivedFines = allFines.filter(
          (f) => f.status === 'WAIVED'
        ).length;
        const totalFinesAmount = allFines.reduce((sum, f) => sum + f.amount, 0);
        const pendingFinesAmount = allFines
          .filter((f) => f.status === 'PENDING')
          .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
        const paidFinesAmount = allFines
          .filter((f) => f.status === 'PAID')
          .reduce((sum, f) => sum + f.paidAmount, 0);

        // Materials by type
        const typeCount: { [key: string]: number } = {};
        allMaterials.forEach((m) => {
          typeCount[m.type] = (typeCount[m.type] || 0) + 1;
        });
        const materialsByTypeArray = Object.entries(typeCount)
          .map(([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / totalMaterials) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        // Top borrowed materials
        const loanCountByMaterial: {
          [key: string]: { title: string; count: number };
        } = {};
        allLoans.forEach((loan) => {
          const materialId = loan.copy.material.id;
          const title = loan.copy.material.title;
          if (!loanCountByMaterial[materialId]) {
            loanCountByMaterial[materialId] = { title, count: 0 };
          }
          loanCountByMaterial[materialId].count++;
        });
        const topBorrowed = Object.entries(loanCountByMaterial)
          .map(([id, data]) => ({
            id,
            title: data.title,
            loans: data.count,
          }))
          .sort((a, b) => b.loans - a.loans)
          .slice(0, 10);

        // Monthly statistics (last 6 months)
        const now = new Date();
        const monthlyData: MonthlyStats[] = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);

          const monthLoans = allLoans.filter((l) => {
            const loanDate = new Date(l.loanDate);
            return loanDate >= monthStart && loanDate <= monthEnd;
          }).length;

          const monthReturns = allLoans.filter((l) => {
            if (!l.returnDate) return false;
            const returnDate = new Date(l.returnDate);
            return returnDate >= monthStart && returnDate <= monthEnd;
          }).length;

          const monthUsers = allUsers.filter((u) => {
            const createdAt = new Date(u.createdAt);
            return createdAt >= monthStart && createdAt <= monthEnd;
          }).length;

          const monthMaterials = allMaterials.filter((m) => {
            const createdAt = new Date(m.createdAt);
            return createdAt >= monthStart && createdAt <= monthEnd;
          }).length;

          monthlyData.push({
            month: format(monthDate, 'MMM yyyy', { locale: es }),
            loans: monthLoans,
            returns: monthReturns,
            newUsers: monthUsers,
            newMaterials: monthMaterials,
          });
        }

        setStats({
          totalUsers,
          activeMembers,
          suspendedMembers,
          totalMaterials,
          totalCopies,
          availableCopies,
          borrowedCopies,
          totalLoans,
          activeLoans,
          overdueLoans,
          returnedLoans,
          averageLoanDuration,
          totalFines,
          pendingFines,
          paidFines,
          cancelledFines,
          waivedFines,
          totalFinesAmount,
          pendingFinesAmount,
          paidFinesAmount,
        });
        setMaterialsByType(materialsByTypeArray);
        setTopBorrowedMaterials(topBorrowed);
        setMonthlyStats(monthlyData);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Error al cargar reportes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [token, authLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Visualiza estadísticas y reportes del sistema
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
          <TabsTrigger value="materials">Materiales</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="fines">Multas</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeMembers} miembros activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total materiales
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMaterials}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCopies} copias totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Préstamos activos
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLoans}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalLoans} préstamos totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Duración promedio
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageLoanDuration}
                </div>
                <p className="text-xs text-muted-foreground">
                  días de préstamo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias mensuales</CardTitle>
              <CardDescription>
                Actividad del sistema en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {month.loans} préstamos
                        </span>
                        <span className="text-muted-foreground">
                          {month.returns} devoluciones
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{
                          width: `${Math.min(
                            100,
                            (month.loans /
                              Math.max(...monthlyStats.map((m) => m.loans))) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Préstamos activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.activeLoans}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Actualmente prestados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préstamos vencidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.overdueLoans}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préstamos completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.returnedLoans}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Devueltos exitosamente
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Materiales más prestados</CardTitle>
              <CardDescription>
                Top 10 materiales con más préstamos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topBorrowedMaterials.map((material, index) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">
                          {material.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {material.loans} préstamos
                        </p>
                      </div>
                    </div>
                    <Badge>{material.loans}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Copias disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.availableCopies}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  De {stats.totalCopies} copias totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Copias prestadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.borrowedCopies}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  En circulación
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasa de utilización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalCopies > 0
                    ? Math.round(
                        (stats.borrowedCopies / stats.totalCopies) * 100
                      )
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Copias en uso
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por tipo de material</CardTitle>
              <CardDescription>
                Cantidad y porcentaje de materiales por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materialsByType.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {item.type === 'BOOK'
                          ? 'Libros'
                          : item.type === 'DVD'
                          ? 'DVDs'
                          : item.type === 'MAGAZINE'
                          ? 'Revistas'
                          : 'Otros'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.count} materiales
                        </span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Miembros activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.activeMembers}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Con cuenta activa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Miembros suspendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.suspendedMembers}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Requieren revisión
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total de usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalUsers}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Miembros y bibliotecarios
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nuevos usuarios por mes</CardTitle>
              <CardDescription>
                Registro de nuevos usuarios en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <span className="text-sm text-muted-foreground">
                        {month.newUsers} nuevos usuarios
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2"
                        style={{
                          width: `${Math.min(
                            100,
                            (month.newUsers /
                              Math.max(
                                ...monthlyStats.map((m) => m.newUsers)
                              )) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fines Tab */}
        <TabsContent value="fines" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Multas pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.pendingFines}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${stats.pendingFinesAmount.toFixed(2)} por cobrar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multas pagadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.paidFines}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${stats.paidFinesAmount.toFixed(2)} recaudados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multas canceladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">
                  {stats.cancelledFines}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total canceladas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen general</CardTitle>
                <CardDescription>
                  Estadísticas generales de multas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">Total de multas</p>
                      <p className="text-xs text-muted-foreground">
                        Todas las multas registradas
                      </p>
                    </div>
                    <div className="text-2xl font-bold">{stats.totalFines}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">
                        Monto total generado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Suma de todas las multas
                      </p>
                    </div>
                    <div className="text-2xl font-bold">
                      ${stats.totalFinesAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">Tasa de pago</p>
                      <p className="text-xs text-muted-foreground">
                        Porcentaje de multas pagadas
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.totalFines > 0
                        ? Math.round((stats.paidFines / stats.totalFines) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de multas</CardTitle>
                <CardDescription>
                  Estado actual de todas las multas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pendientes</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stats.pendingFines} multas
                        </span>
                        <Badge variant="destructive">
                          {stats.totalFines > 0
                            ? Math.round(
                                (stats.pendingFines / stats.totalFines) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-600 rounded-full h-2 transition-all"
                        style={{
                          width: `${
                            stats.totalFines > 0
                              ? (stats.pendingFines / stats.totalFines) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pagadas</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stats.paidFines} multas
                        </span>
                        <Badge variant="default" className="bg-green-600">
                          {stats.totalFines > 0
                            ? Math.round(
                                (stats.paidFines / stats.totalFines) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2 transition-all"
                        style={{
                          width: `${
                            stats.totalFines > 0
                              ? (stats.paidFines / stats.totalFines) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Canceladas</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stats.cancelledFines} multas
                        </span>
                        <Badge variant="outline">
                          {stats.totalFines > 0
                            ? Math.round(
                                (stats.cancelledFines / stats.totalFines) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gray-600 rounded-full h-2 transition-all"
                        style={{
                          width: `${
                            stats.totalFines > 0
                              ? (stats.cancelledFines / stats.totalFines) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Condonadas</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stats.waivedFines} multas
                        </span>
                        <Badge variant="secondary">
                          {stats.totalFines > 0
                            ? Math.round(
                                (stats.waivedFines / stats.totalFines) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2 transition-all"
                        style={{
                          width: `${
                            stats.totalFines > 0
                              ? (stats.waivedFines / stats.totalFines) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
