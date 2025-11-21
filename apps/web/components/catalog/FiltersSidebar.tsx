import { SearchFilters } from '@/types/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { getTypeLabel } from '@/lib/utils/catalog-utils';

interface FiltersSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultsCount: number;
  onClose?: () => void;
}

export function FiltersSidebar({
  filters,
  onFiltersChange,
  resultsCount,
  onClose,
}: FiltersSidebarProps) {
  const materialTypes = ['book', 'dvd', 'magazine', 'cd', 'document', 'map'];
  const languages = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano'];

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter((l) => l !== language)
      : [...filters.languages, language];
    onFiltersChange({ ...filters, languages: newLanguages });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: filters.query,
      types: [],
      languages: [],
      authorName: undefined,
      yearFrom: undefined,
      yearTo: undefined,
    });
  };

  const activeFiltersCount =
    filters.types.length +
    filters.languages.length +
    (filters.authorName ? 1 : 0) +
    (filters.yearFrom ? 1 : 0) +
    (filters.yearTo ? 1 : 0);

  return (
    <Card className={onClose ? '' : 'sticky top-4'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar ({activeFiltersCount})
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {resultsCount} resultados
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Material */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Tipo de Material</h3>
          <div className="space-y-2">
            {materialTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.types.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
                <Label
                  htmlFor={`type-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getTypeLabel(type)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Idioma */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Idioma</h3>
          <div className="space-y-2">
            {languages.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${language}`}
                  checked={filters.languages.includes(language)}
                  onCheckedChange={() => handleLanguageToggle(language)}
                />
                <Label
                  htmlFor={`language-${language}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {language}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Autor */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Autor</h3>
          <Input
            id="author-name"
            type="text"
            placeholder="Nombre del autor"
            value={filters.authorName || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                authorName: e.target.value || undefined,
              })
            }
            className="h-9"
          />
        </div>

        <Separator />

        {/* Año de Publicación */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Año de Publicación</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="year-from" className="text-xs">
                Desde
              </Label>
              <Input
                id="year-from"
                type="number"
                placeholder="1900"
                value={filters.yearFrom || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    yearFrom: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="year-to" className="text-xs">
                Hasta
              </Label>
              <Input
                id="year-to"
                type="number"
                placeholder="2024"
                value={filters.yearTo || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    yearTo: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="h-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
