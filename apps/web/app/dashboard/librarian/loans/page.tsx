'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loansApi } from '@/lib/api/loans';
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
import { Card, CardContent } from '@/components/ui/card';
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
  Plus,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  Filter,
} from 'lucide-react';
import { LoanWithDetails, LoanStatus } from '@library/types';
import CreateLoanDialog from '@/components/loans/CreateLoanDialog';
import ReturnLoanDialog from '@/components/loans/ReturnLoanDialog';

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

const ITEMS_PER_PAGE = 10;

export default function LoansPage() {
  const { token } = useAuth();
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (token) {
      fetchLoans();
    }
  }, [token]);

  useEffect(() => {
    filterLoans();
  }, [loans, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loansApi.getAll({}, token!);
      setLoans(response.loans);
    } catch (error: any) {
      toast.error('Error al cargar préstamos', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = [...loans];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((loan) => loan.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((loan) => {
        const memberName =
          `${loan.member.user.firstName} ${loan.member.user.lastName}`.toLowerCase();
        const materialTitle = loan.copy.material.title.toLowerCase();
        return memberName.includes(query) || materialTitle.includes(query);
      });
    }

    setFilteredLoans(filtered);
  };

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  const handleRenewLoan = async (loanId: string) => {
    try {
      await loansApi.renewLoan(loanId, token!);
      toast.success('Préstamo renovado exitosamente');
      fetchLoans();
    } catch (error: any) {
      toast.error('Error al renovar préstamo', {
        description: error.message,
      });
    }
  };

  const handleOpenReturnDialog = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    setReturnDialogOpen(true);
  };

  const handleReturnSuccess = () => {
    fetchLoans();
    setReturnDialogOpen(false);
    setSelectedLoan(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
          <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los préstamos de materiales del sistema
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo préstamo
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por miembro o material..."
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
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="OVERDUE">Vencidos</SelectItem>
              <SelectItem value="RETURNED">Devueltos</SelectItem>
              <SelectItem value="CANCELLED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron préstamos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Copia</TableHead>
                  <TableHead>Fecha préstamo</TableHead>
                  <TableHead>Fecha vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Renovaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {loan.member.user.firstName}{' '}
                          {loan.member.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loan.member.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {loan.copy.material.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Código: {loan.copy.catalogCode}
                        </p>
                      </div>
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
                        {loan.status === 'ACTIVE' &&
                          isOverdue(loan.dueDate) && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
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
                          {loan.status === 'ACTIVE' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRenewLoan(loan.id)}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Renovar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenReturnDialog(loan)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Devolver
                              </DropdownMenuItem>
                            </>
                          )}
                          {loan.status !== 'ACTIVE' && (
                            <DropdownMenuItem disabled>
                              No hay acciones disponibles
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Mostrando {paginatedLoans.length} de {filteredLoans.length} préstamos
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

      <CreateLoanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchLoans}
      />

      {selectedLoan && (
        <ReturnLoanDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          loan={selectedLoan}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
