'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { finesApi } from '@/lib/api/fines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Search,
  Loader2,
  MoreHorizontal,
  Filter,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { FineWithDetails, FineStatus } from '@library/types';
import PayFineDialog from '@/components/loans/PayFineDialog';

const statusLabels: Record<FineStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  WAIVED: 'Condonada',
};

const statusColors: Record<
  FineStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'destructive',
  PAID: 'secondary',
  WAIVED: 'outline',
};

const ITEMS_PER_PAGE = 10;

export default function FinesPage() {
  const { token } = useAuth();
  const [fines, setFines] = useState<FineWithDetails[]>([]);
  const [filteredFines, setFilteredFines] = useState<FineWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<FineWithDetails | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalFines: 0,
    pendingFines: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    if (token) {
      fetchFines();
    }
  }, [token]);

  useEffect(() => {
    filterFines();
    calculateStats();
  }, [fines, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await finesApi.getAll({}, token!);
      setFines(response.fines);
    } catch (error: any) {
      toast.error('Error al cargar multas', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFines = () => {
    let filtered = [...fines];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((fine) => fine.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((fine) => {
        const memberName =
          `${fine.loan.member.user.firstName} ${fine.loan.member.user.lastName}`.toLowerCase();
        const materialTitle = fine.loan.copy.material.title.toLowerCase();
        const reason = fine.reason.toLowerCase();
        return (
          memberName.includes(query) ||
          materialTitle.includes(query) ||
          reason.includes(query)
        );
      });
    }

    setFilteredFines(filtered);
  };

  const calculateStats = () => {
    const totalFines = fines.length;
    const pendingFines = fines.filter(
      (fine) => fine.status === FineStatus.PENDING
    ).length;
    const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);
    const pendingAmount = fines
      .filter((fine) => fine.status === FineStatus.PENDING)
      .reduce((sum, fine) => sum + (fine.amount - fine.paidAmount), 0);

    setStats({
      totalFines,
      pendingFines,
      totalAmount,
      pendingAmount,
    });
  };

  const totalPages = Math.ceil(filteredFines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFines = filteredFines.slice(startIndex, endIndex);

  const handleOpenPayDialog = (fine: FineWithDetails) => {
    setSelectedFine(fine);
    setPayDialogOpen(true);
  };

  const handlePaySuccess = () => {
    fetchFines();
    setPayDialogOpen(false);
    setSelectedFine(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las multas generadas por préstamos vencidos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de multas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFines}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Multas pendientes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.pendingFines}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monto pendiente
            </CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${stats.pendingAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por miembro, material o razón..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="PAID">Pagadas</SelectItem>
              <SelectItem value="WAIVED">Condonadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Fines Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredFines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron multas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miembro</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Razón</TableHead>
                    <TableHead>Fecha emisión</TableHead>
                    <TableHead className="text-right">Monto total</TableHead>
                    <TableHead className="text-right">Monto pagado</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFines.map((fine) => {
                    const remainingAmount = fine.amount - fine.paidAmount;
                    return (
                      <TableRow key={fine.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {fine.loan.member.user.firstName}{' '}
                              {fine.loan.member.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {fine.loan.member.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {fine.loan.copy.material.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Código: {fine.loan.copy.catalogCode}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{fine.reason}</p>
                        </TableCell>
                        <TableCell>
                          {format(new Date(fine.createdAt), 'dd MMM yyyy', {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${fine.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${fine.paidAmount.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            remainingAmount > 0 ? 'text-destructive' : ''
                          }`}
                        >
                          ${remainingAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[fine.status]}>
                            {statusLabels[fine.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {fine.status === FineStatus.PENDING && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenPayDialog(fine)}
                                >
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Registrar pago
                                </DropdownMenuItem>
                              )}
                              {fine.status !== FineStatus.PENDING && (
                                <DropdownMenuItem disabled>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {fine.status === FineStatus.PAID
                                    ? 'Multa pagada'
                                    : 'Multa condonada'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Mostrando {paginatedFines.length} de {filteredFines.length} multas
        </p>
        {totalPages > 1 ? (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : (
          <div />
        )}
      </div>

      {selectedFine && (
        <PayFineDialog
          open={payDialogOpen}
          onOpenChange={setPayDialogOpen}
          fine={selectedFine}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
