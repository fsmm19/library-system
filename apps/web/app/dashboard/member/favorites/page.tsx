'use client';

import { useState } from 'react';
import { Search, Heart, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/member/EmptyState';
import Link from 'next/link';

export default function MemberFavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real API calls
  const [favorites] = useState([
    {
      id: 1,
      title: 'Clean Code',
      type: 'Libro',
      author: 'Robert C. Martin',
      available: true,
    },
    {
      id: 2,
      title: 'The Pragmatic Programmer',
      type: 'Libro',
      author: 'Andrew Hunt',
      available: false,
    },
    {
      id: 3,
      title: 'Design Patterns',
      type: 'Libro',
      author: 'Gang of Four',
      available: true,
    },
    {
      id: 4,
      title: 'Refactoring',
      type: 'Libro',
      author: 'Martin Fowler',
      available: false,
    },
  ]);

  const handleRemoveFavorite = (id: number) => {
    console.log('Remover favorito:', id);
    // Implement remove favorite logic
  };

  const filteredFavorites = favorites.filter((favorite) =>
    favorite.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Favoritos</h1>
        <p className="text-muted-foreground mt-1">
          Materiales que has marcado como favoritos
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar favoritos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{favorite.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {favorite.author}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {favorite.type}
                      </Badge>
                      {favorite.available ? (
                        <Badge className="bg-green-500 text-xs">Disponible</Badge>
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
                    <Link href={`/catalog/${favorite.id}`}>Ver detalles</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFavorite(favorite.id)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
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
