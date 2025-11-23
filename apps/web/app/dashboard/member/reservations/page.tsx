'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  BookMarked,
  Clock,
  Calendar,
  X,
  CheckCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { reservationsApi } from '@/lib/api/reservations';
import { ReservationWithDetails, ReservationStatus } from '@library/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: 'En cola',
  READY: 'Listo para recoger',
  PICKED_UP: 'Recogido',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

const statusColors: Record<
  ReservationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'default',
  READY: 'default',
  PICKED_UP: 'secondary',
  EXPIRED: 'destructive',
  CANCELLED: 'outline',
};

export default function MemberReservationsPage() {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [reservations, setReservations] = useState<ReservationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeReservations: 0,
    readyForPickup: 0,
    confirmedPickup: 0,
    totalReservations: 0,
  });
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationWithDetails | null>(null);
  const [isConfirmingPickup, setIsConfirmingPickup] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetchReservations();
      fetchStats();
    }
  }, [token, user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationsApi.getAll({}, token!);
      setReservations(response.reservations);
    } catch (error: any) {
      toast.error('Error al cargar reservaciones', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const memberStats = await reservationsApi.getMemberStats(user.id, token!);
      setStats(memberStats);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas', {
        description: error.message,
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await reservationsApi.cancel(id, token!);
      toast.success('Reserva cancelada exitosamente');
      fetchReservations();
      fetchStats();
    } catch (error: any) {
      toast.error('Error al cancelar reserva', {
        description: error.message,
      });
    }
  };

  const handlePickupClick = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation);
    setShowPickupDialog(true);
  };

  const handleConfirmPickup = async () => {
    if (!selectedReservation || !token) return;

    try {
      setIsConfirmingPickup(true);
      await reservationsApi.confirmPickup(selectedReservation.id, token);
      toast.success('Confirmación registrada', {
        description:
          'Dirígete a la biblioteca a recoger tu material. El bibliotecario procesará tu préstamo',
      });
      setShowPickupDialog(false);
      setSelectedReservation(null);
      fetchReservations();
      fetchStats();
    } catch (error: any) {
      toast.error('Error al confirmar recogida', {
        description: error.message,
      });
    } finally {
      setIsConfirmingPickup(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeReservations = reservations.filter(
    (r) => r.status === 'PENDING' || r.status === 'READY'
  );

  const reservationHistory = reservations.filter(
    (r) =>
      r.status === 'PICKED_UP' ||
      r.status === 'EXPIRED' ||
      r.status === 'CANCELLED'
  );

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
        <h1 className="text-3xl font-bold">Mis reservas</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus reservas de materiales
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas activas
            </CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Listas para recoger
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.readyForPickup}
            </div>
            {stats.confirmedPickup > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {stats.confirmedPickup} confirmada
                {stats.confirmedPickup > 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de reservas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
          </CardContent>
        </Card>
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
              <Card key={reservation.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {reservation.material.title}
                        </h3>
                        <Badge variant={statusColors[reservation.status]}>
                          {statusLabels[reservation.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {reservation.material.authors &&
                          reservation.material.authors.length > 0 && (
                            <p>
                              Autor:{' '}
                              {reservation.material.authors
                                .map(
                                  (a) =>
                                    `${a.firstName}${
                                      a.middleName ? ' ' + a.middleName : ''
                                    } ${a.lastName}`
                                )
                                .join(', ')}
                            </p>
                          )}
                        <p>
                          Fecha de reserva:{' '}
                          {format(
                            new Date(reservation.reservationDate),
                            'dd MMM yyyy',
                            { locale: es }
                          )}
                        </p>
                        {reservation.status === 'READY' &&
                          reservation.expirationDate && (
                            <>
                              <p className="text-primary font-medium">
                                Disponible hasta:{' '}
                                {format(
                                  new Date(reservation.expirationDate),
                                  'dd MMM yyyy',
                                  { locale: es }
                                )}
                              </p>
                              {reservation.confirmedAt && (
                                <p className="text-green-600 text-sm font-medium">
                                  ✓ Recogida confirmada el{' '}
                                  {format(
                                    new Date(reservation.confirmedAt),
                                    'dd MMM yyyy',
                                    { locale: es }
                                  )}
                                </p>
                              )}
                            </>
                          )}
                        {reservation.status === 'PENDING' &&
                          reservation.queuePosition && (
                            <p>Posición en cola: {reservation.queuePosition}</p>
                          )}
                        {reservation.notes && (
                          <p className="text-xs">Nota: {reservation.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {reservation.status === 'READY' && (
                        <>
                          {reservation.confirmedAt ? (
                            <Button size="sm" variant="secondary" disabled>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmado
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePickupClick(reservation)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes reservas activas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {reservation.material.title}
                        </h3>
                        <Badge variant={statusColors[reservation.status]}>
                          {statusLabels[reservation.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {reservation.material.authors &&
                          reservation.material.authors.length > 0 && (
                            <p>
                              Autor:{' '}
                              {reservation.material.authors
                                .map(
                                  (a) =>
                                    `${a.firstName}${
                                      a.middleName ? ' ' + a.middleName : ''
                                    } ${a.lastName}`
                                )
                                .join(', ')}
                            </p>
                          )}
                        <p>
                          Fecha de reserva:{' '}
                          {format(
                            new Date(reservation.reservationDate),
                            'dd MMM yyyy',
                            { locale: es }
                          )}
                        </p>
                        {reservation.pickedUpAt && (
                          <p>
                            Recogido:{' '}
                            {format(
                              new Date(reservation.pickedUpAt),
                              'dd MMM yyyy',
                              { locale: es }
                            )}
                          </p>
                        )}
                        {reservation.cancelledAt && (
                          <p>
                            Cancelado:{' '}
                            {format(
                              new Date(reservation.cancelledAt),
                              'dd MMM yyyy',
                              { locale: es }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes historial de reservas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Pickup Confirmation Dialog */}
      <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar recogida de material</DialogTitle>
            <DialogDescription>
              Por favor, acude al mostrador de la biblioteca para recoger tu
              material reservado.
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Material reservado:</h4>
                <p className="text-sm">{selectedReservation.material.title}</p>
                {selectedReservation.material.authors &&
                  selectedReservation.material.authors.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedReservation.material.authors
                        .map(
                          (a) =>
                            `${a.firstName}${
                              a.middleName ? ' ' + a.middleName : ''
                            } ${a.lastName}`
                        )
                        .join(', ')}
                    </p>
                  )}
              </div>

              {selectedReservation.copy && (
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <p className="text-sm font-medium">ID de copia:</p>
                  <p className="text-xs font-mono">
                    {selectedReservation.copy.id}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>ℹ️ Importante:</strong> Al confirmar, se notificará a
                  la biblioteca que planeas recoger este material. Debes
                  dirigirte al mostrador donde el bibliotecario procesará tu
                  préstamo. Recuerda llevar tu identificación.
                </p>
              </div>

              {selectedReservation.expirationDate && (
                <p className="text-xs text-muted-foreground">
                  Disponible hasta:{' '}
                  {format(
                    new Date(selectedReservation.expirationDate),
                    'dd MMM yyyy',
                    { locale: es }
                  )}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPickupDialog(false)}
              disabled={isConfirmingPickup}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmPickup} disabled={isConfirmingPickup}>
              {isConfirmingPickup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar recogida
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
