'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materiales</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el inventario de libros, revistas y otros materiales
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo material
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de materiales</CardTitle>
          <CardDescription>
            Aqui se mostrara el listado completo del inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Funcionalidad en desarrollo</p>
            <p className="text-sm mt-2">
              Proximamente podras gestionar el inventario desde aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
