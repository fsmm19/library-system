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
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loansApi } from '@/lib/api/loans';
import { materialsApi } from '@/lib/api/materials';
import { materialCopiesApi } from '@/lib/api/material-copies';
import { membersApi } from '@/lib/api/members';
import {
  MaterialWithDetails,
  MaterialCopyWithDetails,
  MemberWithUser,
} from '@library/types';

const createLoanSchema = z.object({
  memberId: z.string().uuid('Debe seleccionar un miembro'),
  copyId: z.string().uuid('Debe seleccionar una copia'),
  loanDate: z.string().optional(),
  notes: z.string().optional(),
});

type CreateLoanFormData = z.infer<typeof createLoanSchema>;

interface CreateLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateLoanDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLoanDialogProps) {
  const { token } = useAuth();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [copies, setCopies] = useState<MaterialCopyWithDetails[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLoanFormData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      loanDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open && token) {
      fetchMembers();
      fetchCopies();
    }
  }, [open, token]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await membersApi.getAll(token!);
      setMembers(response || []);
    } catch (error: any) {
      toast.error('Error al cargar miembros', {
        description: error.message,
      });
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchCopies = async () => {
    try {
      setLoadingCopies(true);
      const response = await materialCopiesApi.getAll({}, token!);
      // Filter copies: only AVAILABLE status and not DAMAGED condition
      const filteredCopies = (response.copies || []).filter(
        (copy) => copy.status === 'AVAILABLE' && copy.condition !== 'DAMAGED'
      );
      setCopies(filteredCopies);
    } catch (error: any) {
      toast.error('Error al cargar copias', {
        description: error.message,
      });
      setCopies([]);
    } finally {
      setLoadingCopies(false);
    }
  };

  const onSubmit = async (data: CreateLoanFormData) => {
    try {
      setSubmitting(true);
      await loansApi.create(data, token!);
      toast.success('Préstamo creado exitosamente');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear préstamo', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const memberOptions = (members || []).map((member) => ({
    value: member.userId,
    label: `${member.user.firstName} ${member.user.lastName} (${member.user.email})`,
  }));

  const copyOptions = (copies || []).map((copy) => ({
    value: copy.id,
    label: `${copy.material.title} (${copy.catalogCode})`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Crear préstamo</DialogTitle>
          <DialogDescription>
            Registra un nuevo préstamo de material a un miembro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberId">Miembro *</Label>
              <Controller
                name="memberId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={memberOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleccionar miembro"
                    searchPlaceholder="Buscar miembro..."
                    emptyText="No se encontraron miembros"
                  />
                )}
              />
              {errors.memberId && (
                <p className="text-sm text-destructive">
                  {errors.memberId.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="copyId">Copia del material *</Label>
              <Controller
                name="copyId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={copyOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleccionar copia"
                    searchPlaceholder="Buscar copia de material..."
                    emptyText="No hay copias disponibles"
                  />
                )}
              />
              {errors.copyId && (
                <p className="text-sm text-destructive">
                  {errors.copyId.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="loanDate">Fecha de préstamo</Label>
              <Controller
                name="loanDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar fecha de préstamo"
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                {...register('notes')}
                placeholder="Notas adicionales (opcional)"
              />
            </div>
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
              Crear préstamo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
