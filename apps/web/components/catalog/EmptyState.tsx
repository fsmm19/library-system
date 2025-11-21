import { SearchX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <Card className="mt-8">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Intenta con otros terminos de busqueda o ajusta los filtros aplicados
        </p>
        <div className="space-y-2 text-sm text-muted-foreground mb-6">
          <p>Sugerencias:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verifica la ortografia de las palabras</li>
            <li>Usa terminos mas generales</li>
            <li>Reduce los filtros aplicados</li>
            <li>Intenta buscar por autor o categoria</li>
          </ul>
        </div>
        <Button onClick={onClear} variant="outline">
          Limpiar busqueda y filtros
        </Button>
      </CardContent>
    </Card>
  );
}
