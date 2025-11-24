'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { reservationsApi } from '@/lib/api/reservations';
import { ReservationWithDetails, ReservationStatus } from '@library/types';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  XCircle,
  Loader2,
} from 'lucide-react';
import { UpdateReservationDialog } from '@/components/reservations/UpdateReservationDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

export default function LibrarianReservationsPage() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationWithDetails[]>(
    []
  );
  const [filteredReservations, setFilteredReservations] = useState<
    ReservationWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationWithDetails | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (token) {
      loadReservations();
    }
  }, [token, authLoading, isAuthenticated, router]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const loadReservations = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await reservationsApi.getAll({}, token);
      setReservations(response.reservations);
    } catch (error) {
      toast.error('Error al cargar las reservaciones');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (reservation) => reservation.status === statusFilter
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((reservation) => {
        const memberName =
          `${reservation.member.user.firstName} ${reservation.member.user.lastName}`.toLowerCase();
        const materialTitle = reservation.material.title.toLowerCase();
        return memberName.includes(query) || materialTitle.includes(query);
      });
    }

    setFilteredReservations(filtered);
  };

  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    endIndex
  );

  const handleUpdateExpired = async () => {
    if (!token) return;

    try {
      const result = await reservationsApi.updateExpiredReservations(token);
      toast.success(
        `${result.updated} reservacion(es) expirada(s) actualizada(s)`
      );
      loadReservations();
    } catch (error) {
      toast.error('Error al actualizar reservaciones expiradas');
    }
  };

  const handleUpdateStatus = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    loadReservations();
    setIsUpdateDialogOpen(false);
    setSelectedReservation(null);
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const variants: Record<
      ReservationStatus,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
        icon: any;
      }
    > = {
      PENDING: { variant: 'secondary', label: 'Pendiente', icon: Clock },
      READY: { variant: 'default', label: 'Lista', icon: CheckCircle },
      PICKED_UP: { variant: 'outline', label: 'Recogida', icon: BookOpen },
      EXPIRED: { variant: 'destructive', label: 'Expirada', icon: AlertCircle },
      CANCELLED: { variant: 'destructive', label: 'Cancelada', icon: XCircle },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (authLoading || isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Reservaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las reservaciones de materiales del sistema
          </p>
        </div>
        <Button onClick={handleUpdateExpired} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualizar expiradas
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
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="READY">Listas</SelectItem>
              <SelectItem value="PICKED_UP">Recogidas</SelectItem>
              <SelectItem value="EXPIRED">Expiradas</SelectItem>
              <SelectItem value="CANCELLED">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron reservaciones</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Reserva</TableHead>
                  <TableHead>Fecha Expiración</TableHead>
                  <TableHead>Cola</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {reservation.member.user.firstName}{' '}
                          {reservation.member.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.member.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {reservation.material.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.material.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>
                      {format(
                        new Date(reservation.reservationDate),
                        'dd MMM yyyy',
                        {
                          locale: es,
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      {reservation.expirationDate
                        ? format(
                            new Date(reservation.expirationDate),
                            'dd MMM yyyy',
                            {
                              locale: es,
                            }
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {reservation.queuePosition
                        ? `Posición ${reservation.queuePosition}`
                        : '-'}
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
                          {(reservation.status === ReservationStatus.PENDING ||
                            reservation.status === ReservationStatus.READY) && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(reservation)}
                            >
                              Actualizar estado
                            </DropdownMenuItem>
                          )}
                          {reservation.status !== ReservationStatus.PENDING &&
                            reservation.status !== ReservationStatus.READY && (
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
          Mostrando {paginatedReservations.length} de{' '}
          {filteredReservations.length} reservaciones
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

      {selectedReservation && (
        <UpdateReservationDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          reservation={selectedReservation}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
