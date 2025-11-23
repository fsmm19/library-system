'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  BookOpen,
  Check,
  Film,
  MoreVertical,
  Newspaper,
} from 'lucide-react';
import { MaterialType, MaterialWithDetails } from '@library/types';
import { getTypeIcon, getTypeLabel } from '@/lib/utils/catalog-utils';
import { reservationsApi } from '@/lib/api/reservations';
import { useAuth } from '@/hooks/useAuth';
import { useReservations } from '@/contexts/ReservationsContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from 'sonner';

function formatAuthors(authors: MaterialWithDetails['authors']): string {
  if (!authors || authors.length === 0) return 'Autor desconocido';

  return authors
    .map((author) => {
      const parts = [author.firstName];
      if (author.middleName) parts.push(author.middleName);
      parts.push(author.lastName);
      return parts.join(' ');
    })
    .join(', ');
}
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MaterialListItemProps {
  material: MaterialWithDetails;
  index: number;
}

export function MaterialListItem({ material, index }: MaterialListItemProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { activeReservations, addReservation } = useReservations();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isReserving, setIsReserving] = useState(false);

  const hasActiveReservation = activeReservations.has(material.id);
  const isInFavorites = isFavorite(material.id);

  const handleToggleFavorite = () => {
    if (!user) {
      toast.info('Inicia sesión para guardar favoritos', {
        description: 'Te redirigiremos a la página de inicio de sesión',
      });
      router.push('/auth');
      return;
    }
    toggleFavorite(material.id);
    toast.success(
      isInFavorites ? 'Eliminado de favoritos' : 'Agregado a favoritos'
    );
  };

  const getIconComponent = () => {
    switch (material.type) {
      case MaterialType.BOOK:
        return <BookOpen className="h-5 w-5" />;
      case MaterialType.DVD:
        return <Film className="h-5 w-5" />;
      case MaterialType.MAGAZINE:
        return <Newspaper className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getButtonText = () => {
    if (isReserving) return 'Procesando...';
    if (hasActiveReservation) return 'Ya reservado';

    if (material.availableCopies && material.availableCopies > 0) {
      return 'Reservar para recoger';
    }
    return 'Agregar a lista de espera';
  };
  const handleReserveMaterial = async () => {
    // Verificar autenticación
    if (!user) {
      toast.info('Inicia sesión para solicitar materiales', {
        description: 'Te redirigiremos a la página de inicio de sesión',
      });
      router.push('/auth');
      return;
    }

    if (!token) {
      toast.error('No se pudo autenticar', {
        description: 'Por favor, inicia sesión nuevamente',
      });
      router.push('/auth');
      return;
    }

    try {
      setIsReserving(true);
      await reservationsApi.create(
        {
          materialId: material.id,
          memberId: user.id,
        },
        token
      );

      // Mensaje de éxito diferenciado según disponibilidad
      if (material.availableCopies && material.availableCopies > 0) {
        toast.success('¡Reserva confirmada!', {
          description:
            'El material está listo para recoger. Tienes 7 días para retirarlo.',
        });
      } else {
        toast.success('Reserva registrada', {
          description: 'Te notificaremos cuando el material esté disponible.',
        });
      }
      addReservation(material.id);
    } catch (error: any) {
      console.error('Error al crear reserva:', error);

      // Detectar si ya tiene reserva activa
      if (
        error.message &&
        error.message.includes('Ya tienes una reserva activa')
      ) {
        addReservation(material.id);
        toast.info('Ya tienes una reserva de este material', {
          description: 'Puedes ver tus reservas en tu panel de control',
          action: {
            label: 'Ver reservas',
            onClick: () => router.push('/dashboard/member/reservations'),
          },
        });
      } else {
        toast.error('Error al crear la reserva', {
          description:
            error.message ||
            'No se pudo completar la solicitud. Intenta nuevamente.',
        });
      }
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Index Number */}
          <div className="shrink-0 w-8 text-muted-foreground font-medium">
            {index}
          </div>

          {/* Thumbnail */}
          <div className="shrink-0">
            <Link href={`/catalog/${material.id}`}>
              <div className="w-20 h-28 overflow-hidden bg-muted rounded">
                {material.thumbnail ? (
                  <img
                    src={material.thumbnail}
                    alt={material.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                    {getTypeIcon(material.type)}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Type Badge */}
            <Badge
              variant="outline"
              className="mb-2 flex items-center gap-2 w-fit"
            >
              {getIconComponent()}
              <span className="text-xs">{getTypeLabel(material.type)}</span>
            </Badge>

            {/* Title */}
            <Link href={`/catalog/${material.id}`}>
              <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-1 line-clamp-2">
                {material.title}
              </h3>
              {material.subtitle && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  {material.subtitle}
                </p>
              )}
            </Link>

            {/* Authors */}
            {material.authors.length > 0 && (
              <p className="text-sm mb-1">
                <span className="text-muted-foreground">Por: </span>
                <span className="text-foreground">
                  {formatAuthors(material.authors)}
                </span>
              </p>
            )}

            {/* Language and Pages */}
            <div className="flex gap-4 text-sm text-muted-foreground mb-3">
              <span>Idioma: {material.language}</span>
              {material.book?.numberOfPages && (
                <span>{material.book.numberOfPages} páginas</span>
              )}
              {material.book?.isbn13 && (
                <span>ISBN: {material.book.isbn13}</span>
              )}
            </div>

            {/* Availability */}
            {material.totalCopies !== undefined &&
              material.availableCopies !== undefined && (
                <div className="flex items-center gap-2 mb-3">
                  <Check
                    className={`h-4 w-4 ${
                      material.availableCopies > 0
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      material.availableCopies > 0
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {material.availableCopies > 0
                      ? `${material.availableCopies} de ${
                          material.totalCopies
                        } ${
                          material.totalCopies === 1
                            ? 'copia disponible'
                            : 'copias disponibles'
                        }`
                      : `No hay copias disponibles (${material.totalCopies} ${
                          material.totalCopies === 1
                            ? 'copia total'
                            : 'copias en total'
                        })`}
                  </span>
                </div>
              )}

            {/* Actions */}
            <div className="flex gap-2">
              {user?.role !== 'LIBRARIAN' && (
                <Button
                  variant={hasActiveReservation ? 'secondary' : 'default'}
                  size="sm"
                  onClick={handleReserveMaterial}
                  disabled={isReserving || hasActiveReservation}
                >
                  {getButtonText()}
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/catalog/${material.id}`}>Ver detalles</Link>
              </Button>
            </div>
          </div>

          {/* Right Icons */}
          {user?.role !== 'LIBRARIAN' && (
            <div className="shrink-0 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isInFavorites
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
