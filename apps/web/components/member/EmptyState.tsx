import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Heart, History } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'loans' | 'reservations' | 'favorites' | 'history';
}

export default function EmptyState({ type }: EmptyStateProps) {
  const configs = {
    loans: {
      icon: BookOpen,
      title: 'No tienes prestamos activos',
      message: 'Explora nuestro catalogo y solicita el material que necesites',
      actionText: 'Explorar catalogo',
      actionHref: '/catalog',
    },
    reservations: {
      icon: Calendar,
      title: 'No tienes reservas activas',
      message: 'Puedes reservar materiales que están prestados actualmente',
      actionText: 'Explorar catalogo',
      actionHref: '/catalog',
    },
    favorites: {
      icon: Heart,
      title: 'No tienes favoritos',
      message: 'Marca materiales como favoritos para encontrarlos fácilmente',
      actionText: 'Explorar catalogo',
      actionHref: '/catalog',
    },
    history: {
      icon: History,
      title: 'No hay historial',
      message: 'Aquí aparecerán tus prestamos pasados',
      actionText: 'Explorar catalogo',
      actionHref: '/catalog',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{config.message}</p>
      <Button asChild>
        <Link href={config.actionHref}>{config.actionText}</Link>
      </Button>
    </div>
  );
}
