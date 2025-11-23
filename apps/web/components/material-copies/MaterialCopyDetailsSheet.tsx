import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Barcode,
  BookCopy,
  Calendar,
  Edit,
  MapPin,
  PackageCheck,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { MaterialCopyCondition, MaterialCopyStatus } from '@library/types';

export interface MaterialCopyWithMaterial {
  id: string;
  materialId: string;
  acquisitionDate: string;
  condition: MaterialCopyCondition;
  status: MaterialCopyStatus;
  location: string | null;
  barcode: string | null;
  catalogCode: string | null;
  material?: {
    id: string;
    title: string;
    subtitle: string | null;
    type: string;
    language: string;
  };
}

interface MaterialCopyDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: MaterialCopyWithMaterial | null;
}

const statusLabels: Record<MaterialCopyStatus, string> = {
  AVAILABLE: 'Disponible',
  BORROWED: 'Prestado',
  RESERVED: 'Reservado',
  UNDER_REPAIR: 'En reparación',
  REMOVED: 'Retirado',
};

const statusVariants: Record<
  MaterialCopyStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  AVAILABLE: 'default',
  BORROWED: 'secondary',
  RESERVED: 'secondary',
  UNDER_REPAIR: 'destructive',
  REMOVED: 'outline',
};

const conditionLabels: Record<MaterialCopyCondition, string> = {
  NEW: 'Nuevo',
  GOOD: 'Bueno',
  FAIR: 'Regular',
  DAMAGED: 'Dañado',
  LOST: 'Perdido',
};

const conditionVariants: Record<
  MaterialCopyCondition,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'default',
  GOOD: 'secondary',
  FAIR: 'outline',
  DAMAGED: 'destructive',
  LOST: 'destructive',
};

export default function MaterialCopyDetailsSheet({
  open,
  onOpenChange,
  copy,
}: MaterialCopyDetailsSheetProps) {
  if (!copy) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6 pb-6">
        <SheetHeader>
          <SheetTitle>Detalles de la copia</SheetTitle>
          <SheetDescription>
            Información completa de la copia del material
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Copy Header */}
          <div className="flex flex-col items-center text-center space-y-3 p-4 bg-accent/50 rounded-lg">
            <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookCopy className="h-10 w-10 text-primary" />
            </div>
            <div>
              {copy.material && (
                <>
                  <h3 className="text-xl font-semibold">
                    {copy.material.title}
                  </h3>
                  {copy.material.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {copy.material.subtitle}
                    </p>
                  )}
                </>
              )}
              {copy.catalogCode && (
                <p className="text-sm font-mono text-muted-foreground mt-2">
                  Código: {copy.catalogCode}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant={statusVariants[copy.status]}>
                {statusLabels[copy.status]}
              </Badge>
              <Badge variant={conditionVariants[copy.condition]}>
                {conditionLabels[copy.condition]}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Copy Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Información de la copia
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Fecha de adquisición</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(copy.acquisitionDate)}
                  </p>
                </div>
              </div>

              {copy.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">
                      {copy.location}
                    </p>
                  </div>
                </div>
              )}

              {copy.barcode && (
                <div className="flex items-start gap-3">
                  <Barcode className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Código de barras</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {copy.barcode}
                    </p>
                  </div>
                </div>
              )}

              {copy.catalogCode && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Código de catálogo</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {copy.catalogCode}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <PackageCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Condición</p>
                  <p className="text-sm text-muted-foreground">
                    {conditionLabels[copy.condition]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Detalles técnicos
            </h4>

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  ID de copia
                </span>
                <span className="font-medium text-xs font-mono">{copy.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  ID de material
                </span>
                <span className="font-medium text-xs font-mono">
                  {copy.materialId}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Loan History */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Historial de préstamos
            </h4>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground text-center">
                Historial completo disponible próximamente
              </p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => toast.info('Edición disponible próximamente')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar copia
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
