import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'warning';
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const iconColors = {
    default: 'text-muted-foreground bg-muted',
    primary: 'text-primary bg-primary/20',
    accent: 'text-accent bg-accent/20',
    warning: 'text-warning bg-warning/20',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={cn('p-3 rounded-lg', iconColors[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-accent' : 'text-destructive'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
};
