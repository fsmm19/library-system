'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialWithDetails } from '@library/types';
import { materialsApi } from '@/lib/api/materials';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Film,
  Languages,
  Newspaper,
  Share2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTypeIcon, getTypeLabel } from '@/lib/utils/catalog-utils';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [material, setMaterial] = useState<MaterialWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

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

  const handleRequestLoan = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    // TODO: Implement loan request logic
    alert('Funcionalidad de prestamo en desarrollo');
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
                  <Skeleton className="aspect-[2/3] w-full mb-4" />
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
              {error || 'El material que buscas no existe o no está disponible.'}
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
              Catalogo
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
                <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted mb-4">
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
                  <Badge variant="outline" className="text-sm flex items-center gap-1">
                    {material.type === 'book' && <BookOpen className="h-3 w-3" />}
                    {material.type === 'dvd' && <Film className="h-3 w-3" />}
                    {material.type === 'magazine' && <Newspaper className="h-3 w-3" />}
                    {getTypeLabel(material.type)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  <Button
                    className="w-full"
                    size="lg"
                    variant="secondary"
                    onClick={handleRequestLoan}
                  >
                    Solicitar prestamo
                  </Button>
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
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(material.createdAt).getFullYear()}
                </span>
                <span className="flex items-center gap-1">
                  <Languages className="h-4 w-4" />
                  {material.language}
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
                <CardTitle>Detalles tecnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tipo
                    </dt>
                    <dd className="mt-1 text-sm">
                      {getTypeLabel(material.type)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Idioma
                    </dt>
                    <dd className="mt-1 text-sm">{material.language}</dd>
                  </div>

                  {material.book?.isbn13 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        ISBN-13
                      </dt>
                      <dd className="mt-1 text-sm">{material.book.isbn13}</dd>
                    </div>
                  )}

                  {material.book?.edition && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Edicion
                      </dt>
                      <dd className="mt-1 text-sm">{material.book.edition}</dd>
                    </div>
                  )}

                  {material.book?.numberOfPages && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Numero de paginas
                      </dt>
                      <dd className="mt-1 text-sm">
                        {material.book.numberOfPages}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de registro
                    </dt>
                    <dd className="mt-1 text-sm">
                      {formatDate(material.createdAt)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Authors Details */}
            {material.authors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Autores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {material.authors.map((author) => (
                      <div key={author.id} className="border-l-4 border-primary pl-4">
                        <p className="font-medium">
                          {author.firstName}{' '}
                          {author.middleName && `${author.middleName} `}
                          {author.lastName}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {author.nationality && (
                            <span>Nacionalidad: {author.nationality}</span>
                          )}
                          {author.birthDate && (
                            <span>
                              Fecha de nacimiento: {formatDate(author.birthDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
