import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface MemberStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  link?: string;
  linkText?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  badge?: string;
  attention?: boolean;
}

export default function MemberStatsCard({
  title,
  value,
  icon: Icon,
  description,
  link,
  linkText,
  variant = 'default',
  badge,
  attention = false,
}: MemberStatsCardProps) {
  const variantClasses = {
    default: 'border-border',
    success:
      'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20',
    warning:
      'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20',
    danger:
      'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20',
    info: 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20',
  };

  const iconVariantClasses = {
    default: 'bg-primary/10 text-primary',
    success:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {attention && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {link && linkText && (
              <Link
                href={link}
                className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
              >
                {linkText}
              </Link>
            )}
          </div>
          <div className={`rounded-lg p-3 ${iconVariantClasses[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
