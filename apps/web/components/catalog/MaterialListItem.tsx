import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  Film,
  MoreVertical,
  Newspaper,
} from 'lucide-react';
import { MaterialWithDetails } from '@library/types';
import { getTypeIcon, getTypeLabel } from '@/lib/utils/catalog-utils';

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
  const getIconComponent = () => {
    switch (material.type) {
      case 'book':
        return <BookOpen className="h-5 w-5" />;
      case 'dvd':
        return <Film className="h-5 w-5" />;
      case 'magazine':
        return <Newspaper className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Index Number */}
          <div className="flex-shrink-0 w-8 text-muted-foreground font-medium">
            {index}
          </div>

          {/* Thumbnail */}
          <div className="flex-shrink-0">
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
                <span>{material.book.numberOfPages} paginas</span>
              )}
              {material.book?.isbn13 && (
                <span>ISBN: {material.book.isbn13}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="default" size="sm">
                Solicitar elemento
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/catalog/${material.id}`}>Ver detalles</Link>
              </Button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex-shrink-0 flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/catalog/${material.id}`}>Ver detalles</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Agregar a favoritos</DropdownMenuItem>
                <DropdownMenuItem>Compartir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
