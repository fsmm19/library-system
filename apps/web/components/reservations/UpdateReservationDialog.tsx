'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reservationsApi } from '@/lib/api/reservations';
import { ReservationWithDetails, ReservationStatus } from '@library/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UpdateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationWithDetails;
  onSuccess: () => void;
}

export function UpdateReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: UpdateReservationDialogProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ReservationStatus>(reservation.status);
  const [copyId, setCopyId] = useState<string>(reservation.copyId || '');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [notes, setNotes] = useState<string>(reservation.notes || '');
  const [availableCopies, setAvailableCopies] = useState<
    Array<{ id: string; catalogCode: string }>
  >([]);

  useEffect(() => {
    if (open && status === ReservationStatus.READY) {
      loadAvailableCopies();
    }
  }, [open, status]);

  const loadAvailableCopies = async () => {
    if (!token) return;

    try {
      // Aquí necesitarías un endpoint para obtener copias disponibles del material
      // Por ahora, dejaremos esto vacío y el bibliotecario deberá ingresar el ID manualmente
    } catch (error) {
      console.error('Error loading available copies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (status === ReservationStatus.READY && !copyId) {
      toast.error('Debes especificar una copia cuando el estado es "Lista"');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: any = { status };

      if (status === ReservationStatus.READY) {
        updateData.copyId = copyId;
        if (expirationDate) {
          updateData.expirationDate = expirationDate;
        }
      }

      if (notes !== reservation.notes) {
        updateData.notes = notes;
      }

      await reservationsApi.updateStatus(reservation.id, updateData, token);

      toast.success('Reservación actualizada correctamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la reservación');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableStatuses = () => {
    const statuses: { value: ReservationStatus; label: string }[] = [];

    if (reservation.status === ReservationStatus.PENDING) {
      statuses.push(
        { value: ReservationStatus.READY, label: 'Lista para recoger' },
        { value: ReservationStatus.CANCELLED, label: 'Cancelar' }
      );
    }

    if (reservation.status === ReservationStatus.READY) {
      statuses.push(
        { value: ReservationStatus.PICKED_UP, label: 'Recogida' },
        { value: ReservationStatus.EXPIRED, label: 'Expirada' },
        { value: ReservationStatus.CANCELLED, label: 'Cancelar' }
      );
    }

    return statuses;
  };

  const getDefaultExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Actualizar Reservación</DialogTitle>
            <DialogDescription>
              Cambia el estado de la reservación de{' '}
              <strong>{reservation.member.user.firstName}</strong> para{' '}
              <strong>{reservation.material.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nuevo Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ReservationStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatuses().map((statusOption) => (
                    <SelectItem
                      key={statusOption.value}
                      value={statusOption.value}
                    >
                      {statusOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {status === ReservationStatus.READY && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="copyId">
                    ID de la Copia <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="copyId"
                    value={copyId}
                    onChange={(e) => setCopyId(e.target.value)}
                    placeholder="UUID de la copia disponible"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el ID de la copia disponible que se asignará a esta
                    reservación
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDate">
                    Fecha de Expiración (opcional)
                  </Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder={getDefaultExpirationDate()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Por defecto: 7 días desde hoy
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
