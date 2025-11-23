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
  BookOpen,
  Calendar,
  Edit,
  Globe,
  MapPin,
  Tag,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export type MaterialStatus = 'available' | 'loaned' | 'repair' | 'reserved';

export interface MaterialWithStatus {
  id: string;
  title: string;
  subtitle: string | null;
  type: string;
  language: string;
  publishedDate?: string | null;
  status?: MaterialStatus;
  description?: string;
  authors?: Array<{
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    nationality?: string | null;
    birthDate?: string | null;
  }>;
  book?: {
    id: string;
    isbn13: string | null;
    edition: string | null;
    numberOfPages: number | null;
    materialId: string;
  } | null;
}

interface MaterialDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialWithStatus | null;
}

const statusLabels: Record<MaterialStatus, string> = {
  available: 'Disponible',
  loaned: 'Prestado',
  repair: 'En reparación',
  reserved: 'Reservado',
};

const statusVariants: Record<
  MaterialStatus,
  'default' | 'secondary' | 'destructive'
> = {
  available: 'default',
  loaned: 'secondary',
  repair: 'destructive',
  reserved: 'secondary',
};

const typeLabels: Record<string, string> = {
  BOOK: 'Libro',
  MAGAZINE: 'Revista',
  DVD: 'DVD',
  OTHER: 'Otro',
};

export default function MaterialDetailsSheet({
  open,
  onOpenChange,
  material,
}: MaterialDetailsSheetProps) {
  if (!material) return null;

  const authorsText = material.authors
    ?.map(
      (author) =>
        `${author.firstName}${
          author.middleName ? ' ' + author.middleName : ''
        } ${author.lastName}`
    )
    .join(', ');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>Detalles del material</SheetTitle>
          <SheetDescription>
            Información completa del material bibliográfico
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Material Header */}
          <div className="flex flex-col items-center text-center space-y-3 p-4 bg-accent/50 rounded-lg">
            <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{material.title}</h3>
              {material.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {material.subtitle}
                </p>
              )}
              {material.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {material.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant="outline">
                {typeLabels[material.type] || material.type}
              </Badge>
              {material.status && (
                <Badge variant={statusVariants[material.status]}>
                  {statusLabels[material.status]}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* General Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Información general
            </h4>

            <div className="space-y-3">
              {authorsText && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {material.authors && material.authors.length > 1
                        ? 'Autores'
                        : 'Autor'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {authorsText}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Idioma</p>
                  <p className="text-sm text-muted-foreground">
                    {material.language}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Specific Information */}
          {material.book && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Información del libro
                </h4>

                <div className="rounded-lg border p-4 space-y-3">
                  {material.book.isbn13 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        ISBN-13
                      </span>
                      <span className="font-medium text-sm">
                        {material.book.isbn13}
                      </span>
                    </div>
                  )}
                  {material.book.edition && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Edición
                      </span>
                      <span className="font-medium text-sm">
                        {material.book.edition}
                      </span>
                    </div>
                  )}
                  {material.book.numberOfPages && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Páginas
                      </span>
                      <span className="font-medium text-sm">
                        {material.book.numberOfPages}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

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
              Editar material
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
