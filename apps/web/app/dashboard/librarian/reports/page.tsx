'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Visualiza estadisticas y reportes del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reportes y estadisticas</CardTitle>
          <CardDescription>
            Aqui se mostraran graficos y reportes del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Funcionalidad en desarrollo</p>
            <p className="text-sm mt-2">
              Proximamente podras ver reportes detallados desde aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
