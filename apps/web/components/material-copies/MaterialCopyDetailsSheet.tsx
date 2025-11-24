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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { MaterialCopyCondition, MaterialCopyStatus } from '@library/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { materialCopiesApi } from '@/lib/api/material-copies';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  loans?: Array<{
    id: string;
    loanDate: string;
    dueDate: string;
    returnDate: string | null;
    status: string;
    member: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}

interface MaterialCopyDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: MaterialCopyWithMaterial | null;
  onEdit?: (copy: any) => void;
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
  onEdit,
}: MaterialCopyDetailsSheetProps) {
  const { token } = useAuth();
  const [fullCopy, setFullCopy] = useState<MaterialCopyWithMaterial | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFullDetails = async () => {
      if (open && copy && token) {
        setLoading(true);
        try {
          const details = await materialCopiesApi.getById(copy.id, token);
          setFullCopy(details);
        } catch (error) {
          console.error('Error loading copy details:', error);
          toast.error('Error al cargar los detalles de la copia');
        } finally {
          setLoading(false);
        }
      }
    };
    loadFullDetails();
  }, [open, copy, token]);

  if (!copy) return null;

  const displayCopy = fullCopy || copy;

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
              {displayCopy.material && (
                <>
                  <h3 className="text-xl font-semibold">
                    {displayCopy.material.title}
                  </h3>
                  {displayCopy.material.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {displayCopy.material.subtitle}
                    </p>
                  )}
                </>
              )}
              {displayCopy.catalogCode && (
                <p className="text-sm font-mono text-muted-foreground mt-2">
                  Código: {displayCopy.catalogCode}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant={statusVariants[displayCopy.status]}>
                {statusLabels[displayCopy.status]}
              </Badge>
              <Badge variant={conditionVariants[displayCopy.condition]}>
                {conditionLabels[displayCopy.condition]}
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
                    {formatDate(displayCopy.acquisitionDate)}
                  </p>
                </div>
              </div>

              {displayCopy.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">
                      {displayCopy.location}
                    </p>
                  </div>
                </div>
              )}

              {displayCopy.barcode && (
                <div className="flex items-start gap-3">
                  <Barcode className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Código de barras</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {displayCopy.barcode}
                    </p>
                  </div>
                </div>
              )}

              {displayCopy.catalogCode && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Código de catálogo</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {displayCopy.catalogCode}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <PackageCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Condición</p>
                  <p className="text-sm text-muted-foreground">
                    {conditionLabels[displayCopy.condition]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Material asociado
            </h4>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (displayCopy.materialId) {
                  window.open(`/catalog/${displayCopy.materialId}`, '_blank');
                }
              }}
            >
              <BookCopy className="mr-2 h-4 w-4" />
              Ver detalles del material
            </Button>
          </div>

          <Separator />

          {/* Loan History */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Historial de préstamos
            </h4>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayCopy.loans && displayCopy.loans.length > 0 ? (
              <div
                className={`space-y-2 ${
                  displayCopy.loans.length > 5
                    ? 'max-h-[400px] overflow-y-auto pr-2'
                    : ''
                }`}
              >
                {[...displayCopy.loans]
                  .sort(
                    (a, b) =>
                      new Date(b.loanDate).getTime() -
                      new Date(a.loanDate).getTime()
                  )
                  .map((loan) => (
                    <div
                      key={loan.id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium pb-1">
                            {loan.member.user.firstName}{' '}
                            {loan.member.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Préstamo:{' '}
                            {format(new Date(loan.loanDate), 'PP', {
                              locale: es,
                            })}
                          </p>
                        </div>
                        <Badge
                          variant={loan.returnDate ? 'secondary' : 'default'}
                        >
                          {loan.returnDate ? 'Devuelto' : 'Activo'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          Vencimiento:{' '}
                          {format(new Date(loan.dueDate), 'PP', { locale: es })}
                        </p>
                      </div>
                      {loan.returnDate && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Devuelto:{' '}
                            {format(new Date(loan.returnDate), 'PP', {
                              locale: es,
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground text-center">
                  No hay préstamos registrados para esta copia
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                if (displayCopy && onEdit) {
                  onEdit(displayCopy);
                  onOpenChange(false);
                }
              }}
              disabled={!onEdit}
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
