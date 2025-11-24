'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { finesApi } from '@/lib/api/fines';
import { FineWithDetails, FineStatus } from '@library/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const payFineSchema = z.object({
  paidAmount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .positive('El monto debe ser positivo'),
  paidDate: z.string().min(1, 'La fecha de pago es requerida'),
  notes: z.string().optional(),
});

type PayFineFormData = z.infer<typeof payFineSchema>;

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

interface PayFineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fine: FineWithDetails;
  onSuccess: () => void;
}

export default function PayFineDialog({
  open,
  onOpenChange,
  fine,
  onSuccess,
}: PayFineDialogProps) {
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const remainingAmount = fine.amount - fine.paidAmount;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PayFineFormData>({
    resolver: zodResolver(payFineSchema),
    defaultValues: {
      paidAmount: remainingAmount,
      paidDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const watchedPaidAmount = watch('paidAmount');

  const handlePayFull = () => {
    setValue('paidAmount', remainingAmount);
  };

  const onSubmit = async (data: PayFineFormData) => {
    try {
      setSubmitting(true);

      const totalPaid = fine.paidAmount + data.paidAmount;

      // Determine status based on payment
      let status: FineStatus = FineStatus.PENDING;
      if (totalPaid >= fine.amount) {
        status = FineStatus.PAID;
      }

      await finesApi.update(
        fine.id,
        {
          paidAmount: totalPaid,
          status,
          paidDate: data.paidDate,
          notes: data.notes,
        },
        token!
      );

      toast.success('Pago registrado exitosamente');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al registrar pago', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaiveFine = async () => {
    try {
      setSubmitting(true);
      await finesApi.update(
        fine.id,
        {
          status: FineStatus.WAIVED,
          notes: 'Multa condonada por el bibliotecario',
        },
        token!
      );
      toast.success('Multa condonada exitosamente');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al condonar multa', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Registrar pago de multa</DialogTitle>
          <DialogDescription>
            Registra el pago parcial o total de la multa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2">
          {/* Fine details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant={statusColors[fine.status]}>
                {statusLabels[fine.status]}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Miembro:</span>
              <span className="text-sm">
                {fine.loan.member.user.firstName}{' '}
                {fine.loan.member.user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Material:</span>
              <span className="text-sm">{`${fine.loan.copy.material.title} (${fine.loan.copy.catalogCode})`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Razón:</span>
              <span className="text-sm">{fine.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fecha de emisión:</span>
              <span className="text-sm">
                {format(new Date(fine.createdAt), 'dd MMM yyyy', {
                  locale: es,
                })}
              </span>
            </div>
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-base">
                <span className="font-medium">Monto total:</span>
                <span className="font-semibold">${fine.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Monto pagado:</span>
                <span>${fine.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-destructive">
                <span>Monto pendiente:</span>
                <span>${remainingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="paidAmount">Monto a pagar *</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handlePayFull}
                    className="h-auto p-0"
                  >
                    Pagar total
                  </Button>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    {...register('paidAmount', { valueAsNumber: true })}
                  />
                </div>
                {errors.paidAmount && (
                  <p className="text-sm text-destructive">
                    {errors.paidAmount.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paidDate">Fecha de pago *</Label>
                <Controller
                  name="paidDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar fecha de pago"
                    />
                  )}
                />
                {errors.paidDate && (
                  <p className="text-sm text-destructive">
                    {errors.paidDate.message}
                  </p>
                )}
              </div>
            </div>

            {watchedPaidAmount > remainingAmount && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El monto ingresado excede el monto pendiente. Se registrará el
                  total.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Agregar notas sobre el pago..."
                rows={3}
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleWaiveFine}
                disabled={submitting || fine.status !== FineStatus.PENDING}
                className="sm:mr-auto"
              >
                Condonar multa
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Registrar pago
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
