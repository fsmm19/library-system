import { MaterialType, MaterialWithDetails } from '@library/types';
import { BookOpen, Film, Newspaper } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { getTypeIcon, getTypeLabel } from '@/lib/utils/catalog-utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

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

interface MaterialCardProps {
  material: MaterialWithDetails;
}

export function MaterialCard({ material }: MaterialCardProps) {
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

  const getAvailabilityBadge = () => {
    if (
      material.totalCopies === undefined ||
      material.availableCopies === undefined
    ) {
      return null;
    }

    if (material.availableCopies === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          No disponible
        </Badge>
      );
    }

    const percentage =
      material.totalCopies > 0
        ? (material.availableCopies / material.totalCopies) * 100
        : 0;

    if (percentage <= 25) {
      return (
        <Badge
          variant="outline"
          className="text-xs border-orange-500 text-orange-600"
        >
          Pocas copias
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="text-xs border-green-600 text-green-600"
      >
        Disponible
      </Badge>
    );
  };

  return (
    <Link href={`/catalog/${material.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
        <div className="aspect-2/3 overflow-hidden bg-muted relative">
          {material.thumbnail ? (
            <Image
              src={material.thumbnail}
              alt={material.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getTypeIcon(material.type)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1">
              {getIconComponent()}
              <span className="text-xs">{getTypeLabel(material.type)}</span>
            </Badge>
            {getAvailabilityBadge()}
          </div>

          <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {material.title}
          </h3>

          {material.subtitle && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {material.subtitle}
            </p>
          )}

          <p className="text-sm text-muted-foreground mb-2">
            {formatAuthors(material.authors)}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{material.language}</span>
            {material.book?.numberOfPages && (
              <span className="font-medium">
                {material.book.numberOfPages} pags.
              </span>
            )}
          </div>

          {/* Availability text */}
          {material.totalCopies !== undefined &&
            material.availableCopies !== undefined && (
              <div className="mt-2 pt-2 border-t">
                <p
                  className={`text-xs font-medium ${
                    material.availableCopies === 0
                      ? 'text-red-600'
                      : material.totalCopies > 0 &&
                        (material.availableCopies / material.totalCopies) *
                          100 <=
                          25
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {material.availableCopies} de {material.totalCopies}{' '}
                  disponibles
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </Link>
  );
}
