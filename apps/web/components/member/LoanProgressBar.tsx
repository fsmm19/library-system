import { Progress } from '@/components/ui/progress';
import { differenceInDays } from 'date-fns';

interface LoanProgressBarProps {
  loanDate: Date | string;
  returnDate: Date | string;
  variant?: 'primary' | 'warning' | 'danger';
}

export default function LoanProgressBar({
  loanDate,
  returnDate,
  variant = 'primary',
}: LoanProgressBarProps) {
  const startDate =
    typeof loanDate === 'string' ? new Date(loanDate) : loanDate;
  const endDate =
    typeof returnDate === 'string' ? new Date(returnDate) : returnDate;
  const today = new Date();

  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = differenceInDays(today, startDate);
  const daysRemaining = differenceInDays(endDate, today);

  const percentage = Math.min(
    Math.max((daysElapsed / totalDays) * 100, 0),
    100
  );

  const variantClasses = {
    primary: '[&>div]:bg-primary',
    warning: '[&>div]:bg-yellow-500',
    danger: '[&>div]:bg-red-500',
  };

  const getStatusText = () => {
    if (daysRemaining < 0) {
      return `Vencido hace ${Math.abs(daysRemaining)} días`;
    } else if (daysRemaining === 0) {
      return 'Vence hoy';
    } else if (daysRemaining === 1) {
      return 'Vence mañana';
    } else {
      return `${daysRemaining} días restantes`;
    }
  };

  return (
    <div className="space-y-2">
      <Progress value={percentage} className={variantClasses[variant]} />
      <p className="text-xs text-muted-foreground">{getStatusText()}</p>
    </div>
  );
}
