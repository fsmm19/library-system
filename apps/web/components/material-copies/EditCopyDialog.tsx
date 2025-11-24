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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { materialCopiesApi } from '@/lib/api/material-copies';
import {
  MaterialCopyCondition,
  MaterialCopyStatus,
  MaterialCopyWithDetails,
} from '@library/types';

const editCopySchema = z.object({
  acquisitionDate: z.string().min(1, 'La fecha de adquisición es requerida'),
  condition: z.nativeEnum(MaterialCopyCondition),
  status: z.nativeEnum(MaterialCopyStatus),
  location: z
    .string()
    .max(100, 'La ubicación no puede exceder 100 caracteres')
    .optional(),
  barcode: z
    .string()
    .max(255, 'El código de barras no puede exceder 255 caracteres')
    .optional(),
});

type EditCopyFormData = z.infer<typeof editCopySchema>;

interface EditCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: MaterialCopyWithDetails | null;
  onUpdate: (copy: MaterialCopyWithDetails) => void;
}

const conditionLabels: Record<MaterialCopyCondition, string> = {
  NEW: 'Nuevo',
  GOOD: 'Bueno',
  FAIR: 'Regular',
  DAMAGED: 'Dañado',
  LOST: 'Perdido',
};

const statusLabels: Record<MaterialCopyStatus, string> = {
  AVAILABLE: 'Disponible',
  BORROWED: 'Prestado',
  RESERVED: 'Reservado',
  UNDER_REPAIR: 'En reparación',
  REMOVED: 'Retirado',
};

export default function EditCopyDialog({
  open,
  onOpenChange,
  copy,
  onUpdate,
}: EditCopyDialogProps) {
  const { token } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditCopyFormData>({
    resolver: zodResolver(editCopySchema),
  });

  // Reset form when copy changes
  useEffect(() => {
    if (copy) {
      reset({
        acquisitionDate: copy.acquisitionDate.split('T')[0],
        condition: copy.condition,
        status: copy.status,
        location: copy.location || '',
        barcode: copy.barcode || '',
      });
    }
  }, [copy, reset]);

  const onSubmit = async (data: EditCopyFormData) => {
    if (!token || !copy) {
      toast.error('No está autenticado');
      return;
    }

    try {
      // Convert empty strings to undefined to avoid unique constraint issues
      const updateData = {
        ...data,
        location: data.location || undefined,
        barcode: data.barcode || undefined,
      };

      const updated = await materialCopiesApi.update(
        copy.id,
        updateData,
        token
      );
      toast.success('Copia actualizada correctamente');
      onUpdate(updated);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating copy:', error);
      const errorMessage = error?.message || 'Error al actualizar la copia';
      toast.error('Error al actualizar la copia', {
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!copy) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar copia</DialogTitle>
          <DialogDescription>
            Modifique los detalles de la copia física del material
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Material Info (Read-only) */}
          <div className="space-y-2 rounded-lg border p-3 bg-muted/50">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Material</Label>
              <p className="text-sm font-medium">{copy.material?.title}</p>
            </div>
            {copy.catalogCode && (
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Código de catálogo
                </Label>
                <p className="text-sm font-mono">{copy.catalogCode}</p>
              </div>
            )}
          </div>

          {/* Acquisition Date */}
          <div className="space-y-2">
            <Label htmlFor="acquisitionDate">
              Fecha de adquisición <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="acquisitionDate"
              render={({ field }) => (
                <DatePicker value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.acquisitionDate && (
              <p className="text-sm text-destructive">
                {errors.acquisitionDate.message}
              </p>
            )}
          </div>

          {/* Condition and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">
                Condición <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="condition"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.condition && (
                <p className="text-sm text-destructive">
                  {errors.condition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Estado <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => {
                        // Borrowed and Reserved are always disabled (system-managed)
                        if (['BORROWED', 'RESERVED'].includes(value)) {
                          return (
                            <SelectItem key={value} value={value} disabled>
                              {label}
                            </SelectItem>
                          );
                        }
                        // Available can only be set from UNDER_REPAIR or REMOVED
                        if (value === 'AVAILABLE') {
                          const canSetAvailable = [
                            'UNDER_REPAIR',
                            'REMOVED',
                          ].includes(copy?.status || '');
                          return (
                            <SelectItem
                              key={value}
                              value={value}
                              disabled={!canSetAvailable}
                            >
                              {label}
                            </SelectItem>
                          );
                        }
                        return (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* Location and Barcode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ej: Estante A, Nivel 2"
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Código de barras único"
              />
              {errors.barcode && (
                <p className="text-sm text-destructive">
                  {errors.barcode.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
