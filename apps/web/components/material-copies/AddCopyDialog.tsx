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
import { Combobox } from '@/components/ui/combobox';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { materialsApi } from '@/lib/api/materials';
import { materialCopiesApi } from '@/lib/api/material-copies';
import {
  MaterialCopyCondition,
  MaterialCopyStatus,
  MaterialWithDetails,
  MaterialCopyWithDetails,
} from '@library/types';

const addCopySchema = z.object({
  materialId: z.string().uuid('Debe seleccionar un material'),
  acquisitionDate: z.string().min(1, 'La fecha de adquisición es requerida'),
  condition: z.nativeEnum(MaterialCopyCondition),
  status: z.nativeEnum(MaterialCopyStatus),
});

type AddCopyFormData = z.infer<typeof addCopySchema>;

interface AddCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (copy: MaterialCopyWithDetails) => void;
  preselectedMaterialId?: string;
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

export default function AddCopyDialog({
  open,
  onOpenChange,
  onAdd,
  preselectedMaterialId,
}: AddCopyDialogProps) {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddCopyFormData>({
    resolver: zodResolver(addCopySchema),
    defaultValues: {
      materialId: preselectedMaterialId || '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      condition: MaterialCopyCondition.GOOD,
      status: MaterialCopyStatus.AVAILABLE,
    },
  });

  // Load all materials when dialog opens
  useEffect(() => {
    const loadMaterials = async () => {
      if (open && token) {
        setLoadingMaterials(true);
        try {
          const response = await materialsApi.search(
            {
              page: 1,
              pageSize: 100,
            },
            token
          );
          setMaterials(response.materials);
        } catch (error) {
          console.error('Error loading materials:', error);
          toast.error('Error al cargar los materiales');
        } finally {
          setLoadingMaterials(false);
        }
      }
    };
    loadMaterials();
  }, [open, token]);

  // Set preselected material
  useEffect(() => {
    if (preselectedMaterialId) {
      setValue('materialId', preselectedMaterialId);
    }
  }, [preselectedMaterialId, setValue]);

  const onSubmit = async (data: AddCopyFormData) => {
    if (!token) {
      toast.error('No está autenticado');
      return;
    }

    try {
      const newCopy = await materialCopiesApi.create(data, token);
      toast.success('Copia agregada correctamente');
      onAdd(newCopy);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating copy:', error);
      toast.error('Error al agregar la copia');
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar nueva copia</DialogTitle>
          <DialogDescription>
            Registre una nueva copia física de un material en el catálogo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materialId">
              Material <span className="text-destructive">*</span>
            </Label>
            {preselectedMaterialId ? (
              <Input
                value={
                  materials.find((m) => m.id === preselectedMaterialId)
                    ?.title || 'Material seleccionado'
                }
                disabled
              />
            ) : (
              <Controller
                control={control}
                name="materialId"
                render={({ field }) => (
                  <Combobox
                    options={materials.map((material) => {
                      const authorsText =
                        material.authors && material.authors.length > 0
                          ? material.authors
                              .map((author) =>
                                `${author.firstName} ${author.lastName}`.trim()
                              )
                              .join(', ')
                          : '';
                      return {
                        value: material.id,
                        label: `${material.title}${
                          authorsText ? ` - ${authorsText}` : ''
                        }`,
                      };
                    })}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Buscar y seleccionar material..."
                    searchPlaceholder="Buscar por título o autor(es)..."
                    emptyText="No se encontró ningún material."
                    disabled={isSubmitting || loadingMaterials}
                  />
                )}
              />
            )}
            {errors.materialId && (
              <p className="text-sm text-destructive">
                {errors.materialId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="acquisitionDate">
              Fecha de adquisición <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="acquisitionDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar fecha"
                  disabled={isSubmitting}
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 1}
                />
              )}
            />
            {errors.acquisitionDate && (
              <p className="text-sm text-destructive">
                {errors.acquisitionDate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">
                Condición <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="condition"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar condición" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels)
                        .filter(([value]) => value !== 'LOST')
                        .map(([value, label]) => (
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels)
                        .filter(
                          ([value]) =>
                            !['BORROWED', 'RESERVED', 'REMOVED'].includes(value)
                        )
                        .map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
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
                  Agregando...
                </>
              ) : (
                'Agregar copia'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
