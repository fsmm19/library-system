'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialType, MaterialWithDetails } from '@library/types';
import { materialsApi } from '@/lib/api/materials';
import { reservationsApi } from '@/lib/api/reservations';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Film,
  Languages,
  Newspaper,
  Share2,
  Tag,
  BookMarked,
  MapPin,
  Package,
  Barcode,
  LogIn,
  ChartBarBig,
  BookCheck,
  FileDigit,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getTypeIcon,
  getTypeLabel,
  getLanguageLabel,
  getCopyStatusLabel,
  getCopyConditionLabel,
  getCopyStatusColor,
} from '@/lib/utils/catalog-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useReservations } from '@/contexts/ReservationsContext';

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

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Desconocida';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { activeReservations, addReservation } = useReservations();
  const [material, setMaterial] = useState<MaterialWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  const id = params.id as string;
  const hasActiveReservation = id ? activeReservations.has(id) : false;

  useEffect(() => {
    const fetchMaterial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await materialsApi.getById(id);
        setMaterial(data);
      } catch (err) {
        console.error('Error fetching material:', err);
        setError('No se pudo cargar el material');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const handleShare = async () => {
    if (!material) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: material.title,
          text: `${material.title} - ${formatAuthors(material.authors)}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleReserveMaterial = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!token || !material) return;

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
        toast.error('Error al crear reserva', {
          description:
            error.message ||
            'No se pudo completar la solicitud. Intenta nuevamente.',
        });
      }
    } finally {
      setIsReserving(false);
    }
  };

  const handleRequestLoan = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    // TODO: Implement loan request logic
    alert('Funcionalidad de préstamo en desarrollo');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="aspect-2/3 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Material no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              {error ||
                'El material que buscas no existe o no está disponible.'}
            </p>
            <Button onClick={() => router.push('/catalog')}>
              Volver al catalogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link
              href="/catalog"
              className="hover:text-foreground transition-colors"
            >
              Catálogo
            </Link>
            <span>/</span>
            <span className="text-foreground">
              {getTypeLabel(material.type)}
            </span>
            <span>/</span>
            <span className="text-foreground truncate">{material.title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/catalog')}
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al catalogo
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="aspect-2/3 w-full overflow-hidden rounded-lg bg-muted mb-4">
                  {material.thumbnail ? (
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">
                      {getTypeIcon(material.type)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="text-sm flex items-center gap-1"
                  >
                    {material.type === MaterialType.BOOK && (
                      <BookOpen className="h-3 w-3" />
                    )}
                    {material.type === MaterialType.DVD && (
                      <Film className="h-3 w-3" />
                    )}
                    {material.type === MaterialType.MAGAZINE && (
                      <Newspaper className="h-3 w-3" />
                    )}
                    {getTypeLabel(material.type)}
                  </Badge>
                  {material.availableCopies !== undefined &&
                    material.totalCopies !== undefined && (
                      <Badge
                        variant={
                          material.availableCopies === 0
                            ? 'destructive'
                            : material.availableCopies / material.totalCopies <=
                              0.25
                            ? 'outline'
                            : 'default'
                        }
                        className="text-sm"
                      >
                        {material.totalCopies === 0
                          ? 'Sin copias'
                          : material.availableCopies === 0
                          ? 'No disponible'
                          : `${material.availableCopies} de ${material.totalCopies} disponibles`}
                      </Badge>
                    )}
                </div>

                {material.availableCopies !== undefined &&
                  material.availableCopies === 0 &&
                  material.totalCopies !== undefined &&
                  material.totalCopies > 0 && (
                    <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground mb-3">
                      <p className="font-medium mb-1">
                        No hay copias disponibles
                      </p>
                      <p className="text-xs">
                        Puedes hacer una reserva y te notificaremos cuando esté
                        disponible.
                      </p>
                    </div>
                  )}

                <div className="space-y-2">
                  <Button className="w-full" size="lg" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  {user && user.role === 'MEMBER' && (
                    <>
                      {material.availableCopies !== undefined &&
                      material.availableCopies === 0 ? (
                        <Button
                          className="w-full"
                          size="lg"
                          variant={
                            hasActiveReservation ? 'secondary' : 'outline'
                          }
                          onClick={handleReserveMaterial}
                          disabled={isReserving || hasActiveReservation}
                        >
                          <BookMarked className="h-4 w-4 mr-2" />
                          {hasActiveReservation
                            ? 'Ya reservado'
                            : isReserving
                            ? 'Reservando...'
                            : 'Reservar material'}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          size="lg"
                          variant={
                            hasActiveReservation ? 'secondary' : 'default'
                          }
                          onClick={handleReserveMaterial}
                          disabled={isReserving || hasActiveReservation}
                        >
                          <BookMarked className="h-4 w-4 mr-2" />
                          {hasActiveReservation
                            ? 'Ya reservado'
                            : isReserving
                            ? 'Reservando...'
                            : material.availableCopies &&
                              material.availableCopies > 0
                            ? 'Reservar para recoger'
                            : 'Agregar a lista de espera'}
                        </Button>
                      )}
                    </>
                  )}
                  {!user && (
                    <Button
                      className="w-full"
                      size="lg"
                      variant="secondary"
                      onClick={() => router.push('/auth')}
                    >
                      Iniciar sesión para reservar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{material.title}</h1>
              {material.subtitle && (
                <p className="text-xl text-muted-foreground mb-4">
                  {material.subtitle}
                </p>
              )}
              {material.authors.length > 0 && (
                <p className="text-xl text-muted-foreground mb-4">
                  {formatAuthors(material.authors)}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {material.publishedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(material.publishedDate).getFullYear()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Languages className="h-4 w-4" />
                  {getLanguageLabel(material.language)}
                </span>
              </div>
            </div>

            {/* Description */}
            {material.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Acerca de este material</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {material.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {material.publishedDate && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de publicación
                      </dt>
                      <dd className="mt-1 text-sm">
                        {formatDate(material.publishedDate)}
                      </dd>
                    </div>
                  )}

                  {material.categories && material.categories.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ChartBarBig className="h-4 w-4" />
                        {material.categories.length > 1
                          ? 'Categorías'
                          : 'Categoría'}
                      </dt>
                      <dd className="mt-1 text-sm flex flex-wrap gap-1">
                        {material.categories.map((category) => (
                          <Badge
                            key={category.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  )}

                  {material.book?.isbn13 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Barcode className="h-4 w-4" />
                        ISBN-13
                      </dt>
                      <dd className="mt-1 text-sm">{material.book.isbn13}</dd>
                    </div>
                  )}

                  {material.book?.numberOfPages && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileDigit className="h-4 w-4" />
                        Número de páginas
                      </dt>
                      <dd className="mt-1 text-sm">
                        {material.book.numberOfPages}
                      </dd>
                    </div>
                  )}

                  {material.book?.edition && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Edición
                      </dt>
                      <dd className="mt-1 text-sm">{material.book.edition}</dd>
                    </div>
                  )}

                  {material.book?.publisher && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BookCheck className="h-4 w-4" />
                        Editorial
                      </dt>
                      <dd className="mt-1">{material.book.publisher.name}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Authors Details */}
            {material.authors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Autor(es)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {material.authors.map((author) => (
                      <div
                        key={author.id}
                        className="border-l-4 border-primary pl-4"
                      >
                        <p className="font-medium">
                          {author.firstName}{' '}
                          {author.middleName && `${author.middleName} `}
                          {author.lastName}
                        </p>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                          {author.birthDate && (
                            <span>
                              Fecha de nacimiento:{' '}
                              {formatDate(author.birthDate)}
                            </span>
                          )}
                          {author.countryOfOrigin && (
                            <span>
                              País de origen: {author.countryOfOrigin.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability and Actions */}
            <Card
              className={
                material.availableCopies !== undefined &&
                material.availableCopies > 0
                  ? 'border-success/50 bg-success/5'
                  : 'border-destructive/50 bg-destructive/5'
              }
            >
              <CardHeader>
                <CardTitle>Disponibilidad y acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {material.availableCopies !== undefined &&
                      material.availableCopies > 0
                        ? '✅ Disponible'
                        : '🔒 No disponible'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {material.availableCopies ?? 0} de{' '}
                      {material.totalCopies ?? 0} copias disponibles
                    </p>
                  </div>
                </div>

                {material.copies && material.copies.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Copias individuales:
                      </p>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Ubicación</TableHead>
                              <TableHead>Condición</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {material.copies.map((copy) => (
                              <TableRow key={copy.id}>
                                <TableCell className="font-mono text-xs">
                                  {copy.catalogCode || copy.id.slice(0, 8)}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {copy.location || 'No especificada'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {getCopyConditionLabel(copy.condition)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getCopyStatusColor(
                                      copy.status
                                    )}`}
                                  >
                                    {getCopyStatusLabel(copy.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}

                {!user && (
                  <>
                    <Separator />
                    <Card className="bg-muted/50 border-dashed">
                      <CardContent className="pt-6 text-center space-y-3">
                        <LogIn className="h-8 w-8 text-primary mx-auto" />
                        <div>
                          <p className="font-medium mb-1">
                            Necesitas una cuenta para reservar un material
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Inicia sesión o regístrate para acceder a todos los
                            servicios
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button size="lg" asChild>
                            <Link href="/auth?tab=login">
                              <LogIn className="h-4 w-4 mr-2" />
                              Iniciar sesión
                            </Link>
                          </Button>
                          <Button variant="outline" size="lg" asChild>
                            <Link href="/auth?tab=register">Registrarse</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Historial */}
            <Card>
              <CardHeader>
                <CardTitle>Historial</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  {material.copies && material.copies.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Fecha de adquisición
                      </dt>
                      <dd className="mt-1">
                        {formatDate(material.copies[0].acquisitionDate)}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Última actualización
                    </dt>
                    <dd className="mt-1">{formatDate(material.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Número de veces prestado
                    </dt>
                    <dd className="mt-1">
                      {material.totalLoans !== undefined
                        ? `${material.totalLoans} ${
                            material.totalLoans === 1 ? 'vez' : 'veces'
                          }`
                        : 'No disponible'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
