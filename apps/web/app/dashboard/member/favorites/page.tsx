'use client';

import { useState, useEffect } from 'react';
import { Search, Heart, BookOpen, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/member/EmptyState';
import Link from 'next/link';
import { useFavorites } from '@/contexts/FavoritesContext';
import { materialsApi } from '@/lib/api/materials';
import { MaterialWithDetails } from '@library/types';
import { getTypeLabel } from '@/lib/utils/catalog-utils';
import { toast } from 'sonner';

export default function MemberFavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    favorites,
    removeFavorite,
    isLoading: favoritesLoading,
  } = useFavorites();
  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteMaterials = async () => {
      if (favorites.size === 0) {
        setMaterials([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const materialPromises = Array.from(favorites).map((id) =>
          materialsApi.getById(id).catch(() => null)
        );
        const results = await Promise.all(materialPromises);
        setMaterials(
          results.filter((m) => m !== null) as MaterialWithDetails[]
        );
      } catch (error) {
        console.error('Error fetching favorite materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteMaterials();
    }
  }, [favorites, favoritesLoading]);

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
    toast.success('Eliminado de favoritos');
  };

  const filteredFavorites = materials.filter((material) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis favoritos</h1>
        <p className="text-muted-foreground mt-1">
          {materials.length}{' '}
          {materials.length === 1 ? 'material' : 'materiales'} marcados como
          favoritos
        </p>
      </div>

      {/* Search */}
      {materials.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar favoritos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((material) => (
            <Card key={material.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{material.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {material.authors
                        .map((a) => `${a.firstName} ${a.lastName}`)
                        .join(', ') || 'Autor desconocido'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(material.type)}
                      </Badge>
                      {material.availableCopies !== undefined &&
                      material.availableCopies > 0 ? (
                        <Badge className="bg-green-500 text-xs">
                          Disponible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          No disponible
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/catalog/${material.id}`}>Ver detalles</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFavorite(material.id)}
                    title="Quitar de favoritos"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState type="favorites" />
      )}
    </div>
  );
}
