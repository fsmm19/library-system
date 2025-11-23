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
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loansApi } from '@/lib/api/loans';
import { LoanWithDetails } from '@library/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

const returnLoanSchema = z.object({
  returnDate: z.string().min(1, 'La fecha de devolución es requerida'),
});

type ReturnLoanFormData = z.infer<typeof returnLoanSchema>;

interface ReturnLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: LoanWithDetails;
  onSuccess: () => void;
}

export default function ReturnLoanDialog({
  open,
  onOpenChange,
  loan,
  onSuccess,
}: ReturnLoanDialogProps) {
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReturnLoanFormData>({
    resolver: zodResolver(returnLoanSchema),
    defaultValues: {
      returnDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ReturnLoanFormData) => {
    try {
      setSubmitting(true);
      await loansApi.returnLoan(loan.id, data.returnDate, token!);
      toast.success('Material devuelto exitosamente');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al devolver material', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = new Date(loan.dueDate) < new Date();
  const daysOverdue = isOverdue
    ? Math.ceil(
        (new Date().getTime() - new Date(loan.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Devolver material</DialogTitle>
          <DialogDescription>
            Registra la devolución del material prestado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loan details */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Miembro:</span>
              <span className="text-sm">
                {loan.member.user.firstName} {loan.member.user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Material:</span>
              <span className="text-sm">{loan.copy.material.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fecha de préstamo:</span>
              <span className="text-sm">
                {format(new Date(loan.loanDate), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fecha de vencimiento:</span>
              <span className="text-sm">
                {format(new Date(loan.dueDate), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Renovaciones:</span>
              <span className="text-sm">{loan.renewalCount}</span>
            </div>
          </div>

          {/* Overdue warning */}
          {isOverdue && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este préstamo está vencido por {daysOverdue} día(s). Se
                generará automáticamente una multa al devolver.
              </AlertDescription>
            </Alert>
          )}

          {/* Return form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="returnDate">Fecha de devolución *</Label>
              <Controller
                name="returnDate"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} value={field.value || ''} />
                )}
              />
              {errors.returnDate && (
                <p className="text-sm text-destructive">
                  {errors.returnDate.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar devolución
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
