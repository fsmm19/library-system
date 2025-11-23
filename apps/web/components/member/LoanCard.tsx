import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, RefreshCw } from 'lucide-react';
import LoanProgressBar from './LoanProgressBar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LoanCardProps {
  id: number;
  material: {
    title: string;
    type: string;
    author?: string;
  };
  loanDate: Date | string;
  returnDate: Date | string;
  status: 'active' | 'overdue' | 'due_soon';
  variant?: 'compact' | 'expanded';
  onRenew?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

export default function LoanCard({
  id,
  material,
  loanDate,
  returnDate,
  status,
  variant = 'compact',
  onRenew,
  onViewDetails,
}: LoanCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'due_soon':
        return <Badge className="bg-yellow-500">Por vencer</Badge>;
      default:
        return <Badge variant="secondary">Activo</Badge>;
    }
  };

  const getProgressVariant = () => {
    switch (status) {
      case 'overdue':
        return 'danger';
      case 'due_soon':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const formattedReturnDate = format(
    typeof returnDate === 'string' ? new Date(returnDate) : returnDate,
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
              <div className="mt-4">
                <LoanProgressBar
                  loanDate={loanDate}
                  returnDate={returnDate}
                  variant={getProgressVariant()}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {onRenew && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRenew(id)}
                  disabled={status === 'overdue'}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {onViewDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails(id)}
                >
                  Ver
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
                <p className="text-muted-foreground">Fecha de devolución</p>
                <p className="font-medium mt-1">{formattedReturnDate}</p>
              </div>
            </div>
            <div className="mt-4">
              <LoanProgressBar
                loanDate={loanDate}
                returnDate={returnDate}
                variant={getProgressVariant()}
              />
            </div>
            <div className="mt-4 flex gap-2">
              {onViewDetails && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(id)}
                >
                  Ver detalles
                </Button>
              )}
              {onRenew && (
                <Button
                  size="sm"
                  onClick={() => onRenew(id)}
                  disabled={status === 'overdue'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renovar préstamo
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
