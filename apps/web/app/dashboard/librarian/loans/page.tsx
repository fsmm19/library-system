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

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prestamos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los prestamos de materiales del sistema
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo préstamo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de prestamos</CardTitle>
          <CardDescription>
            Aquí se mostrara la lista de todos los prestamos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Funcionalidad en desarrollo</p>
            <p className="text-sm mt-2">
              Próximamente podrás gestionar prestamos desde aquí
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
