import { SearchFilters } from '@/types/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { getTypeLabel } from '@/lib/utils/catalog-utils';
import { useState, useEffect } from 'react';
import { materialsApi } from '@/lib/api/materials';
import { Category } from '@library/types';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const materialTypes = ['BOOK', 'DVD', 'MAGAZINE', 'OTHER'];
  const languages = [
    { code: 'ES', label: 'Español' },
    { code: 'EN', label: 'Inglés' },
    { code: 'FR', label: 'Francés' },
    { code: 'DE', label: 'Alemán' },
    { code: 'OTHER', label: 'Otro' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await materialsApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Estado local para los campos de año
  const [yearFromInput, setYearFromInput] = useState<string>(
    filters.yearFrom?.toString() || ''
  );
  const [yearToInput, setYearToInput] = useState<string>(
    filters.yearTo?.toString() || ''
  );

  // Sincronizar estado local cuando cambien los filtros externos
  useEffect(() => {
    setYearFromInput(filters.yearFrom?.toString() || '');
    setYearToInput(filters.yearTo?.toString() || '');
  }, [filters.yearFrom, filters.yearTo]);

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = filters.languages || [];
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter((l) => l !== language)
      : [...currentLanguages, language];
    onFiltersChange({ ...filters, languages: newLanguages });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((c) => c !== categoryId)
      : [...currentCategories, categoryId];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleAvailabilityChange = (
    value: 'all' | 'available' | 'unavailable'
  ) => {
    onFiltersChange({
      ...filters,
      availability: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    setYearFromInput('');
    setYearToInput('');
    onFiltersChange({
      query: filters.query,
      types: [],
      languages: [],
      categories: [],
      availability: undefined,
      authorName: undefined,
      yearFrom: undefined,
      yearTo: undefined,
    });
  };

  const activeFiltersCount =
    (filters.types?.length || 0) +
    (filters.languages?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.availability ? 1 : 0) +
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
        {/* Tipo de material */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Tipo de material</h3>
          <div className="space-y-2">
            {materialTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.types?.includes(type) || false}
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
              <div key={language.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${language.code}`}
                  checked={filters.languages?.includes(language.code) || false}
                  onCheckedChange={() => handleLanguageToggle(language.code)}
                />
                <Label
                  htmlFor={`language-${language.code}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {language.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Categorías */}
        {categories.length > 0 && (
          <>
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Categorías</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories?.includes(category.id) || false}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Disponibilidad */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Disponibilidad</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availability-all"
                checked={!filters.availability}
                onCheckedChange={() => handleAvailabilityChange('all')}
              />
              <Label
                htmlFor="availability-all"
                className="text-sm font-normal cursor-pointer"
              >
                Todos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availability-available"
                checked={filters.availability === 'available'}
                onCheckedChange={() => handleAvailabilityChange('available')}
              />
              <Label
                htmlFor="availability-available"
                className="text-sm font-normal cursor-pointer"
              >
                Solo disponibles
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availability-unavailable"
                checked={filters.availability === 'unavailable'}
                onCheckedChange={() => handleAvailabilityChange('unavailable')}
              />
              <Label
                htmlFor="availability-unavailable"
                className="text-sm font-normal cursor-pointer"
              >
                Solo no disponibles
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Año de publicación */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Año de publicación</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="year-from" className="text-xs">
                Desde
              </Label>
              <Input
                id="year-from"
                type="number"
                placeholder="1900"
                min="1900"
                max="2100"
                value={yearFromInput}
                onChange={(e) => setYearFromInput(e.target.value)}
                onBlur={() => {
                  const numValue = yearFromInput
                    ? parseInt(yearFromInput)
                    : undefined;
                  const newValue =
                    numValue && numValue >= 1900 ? numValue : undefined;
                  if (newValue !== filters.yearFrom) {
                    onFiltersChange({
                      ...filters,
                      yearFrom: newValue,
                    });
                  }
                }}
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
                placeholder="2025"
                min="1900"
                max="2100"
                value={yearToInput}
                onChange={(e) => setYearToInput(e.target.value)}
                onBlur={() => {
                  const numValue = yearToInput
                    ? parseInt(yearToInput)
                    : undefined;
                  const newValue =
                    numValue && numValue <= 2100 ? numValue : undefined;
                  if (newValue !== filters.yearTo) {
                    onFiltersChange({
                      ...filters,
                      yearTo: newValue,
                    });
                  }
                }}
                className="h-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
