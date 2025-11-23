import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationCardProps {
  id: number;
  material: {
    title: string;
    type: string;
    author?: string;
  };
  reservationDate: Date | string;
  expirationDate: Date | string;
  status: 'active' | 'ready' | 'expired';
  queuePosition?: number;
  variant?: 'compact' | 'expanded';
  onPickup?: (id: number) => void;
  onCancel?: (id: number) => void;
}

export default function ReservationCard({
  id,
  material,
  reservationDate,
  expirationDate,
  status,
  queuePosition,
  variant = 'compact',
  onPickup,
  onCancel,
}: ReservationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-500">Listo para recoger</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return <Badge variant="secondary">En espera</Badge>;
    }
  };

  const expirationDateObj =
    typeof expirationDate === 'string'
      ? new Date(expirationDate)
      : expirationDate;
  const daysUntilExpiration = differenceInDays(expirationDateObj, new Date());

  const formattedReservationDate = format(
    typeof reservationDate === 'string'
      ? new Date(reservationDate)
      : reservationDate,
    "d 'de' MMMM, yyyy",
    { locale: es }
  );

  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{material.title}</h3>
                  {material.author && (
                    <p className="text-sm text-muted-foreground truncate">
                      {material.author}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {material.type}
                    </Badge>
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
              {status === 'active' && queuePosition !== undefined && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Posición en cola: {queuePosition}</span>
                </div>
              )}
              {status === 'ready' && daysUntilExpiration >= 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {daysUntilExpiration === 0
                      ? 'Expira hoy'
                      : `Expira en ${daysUntilExpiration} ${
                          daysUntilExpiration === 1 ? 'dia' : 'días'
                        }`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {onPickup && status === 'ready' && (
                <Button size="sm" onClick={() => onPickup(id)}>
                  Recoger
                </Button>
              )}
              {onCancel && status !== 'expired' && (
                <Button size="sm" variant="ghost" onClick={() => onCancel(id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{material.title}</h3>
                {material.author && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {material.author}
                  </p>
                )}
              </div>
              {getStatusBadge()}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium mt-1">{material.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de reserva</p>
                <p className="font-medium mt-1">{formattedReservationDate}</p>
              </div>
              {status === 'active' && queuePosition !== undefined && (
                <div>
                  <p className="text-muted-foreground">Posición en cola</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{queuePosition}</p>
                  </div>
                </div>
              )}
              {status === 'ready' && daysUntilExpiration >= 0 && (
                <div>
                  <p className="text-muted-foreground">Expira en</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    <p className="font-medium text-yellow-600 dark:text-yellow-500">
                      {daysUntilExpiration === 0
                        ? 'Hoy'
                        : `${daysUntilExpiration} ${
                            daysUntilExpiration === 1 ? 'dia' : 'días'
                          }`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              {onPickup && status === 'ready' && (
                <Button size="sm" onClick={() => onPickup(id)}>
                  Recoger reserva
                </Button>
              )}
              {onCancel && status !== 'expired' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar reserva
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
