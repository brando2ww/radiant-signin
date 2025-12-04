import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    percentage: number;
    direction: 'up' | 'down';
  };
  className?: string;
  delay?: number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-green-500/10 border-green-500/20',
  danger: 'bg-red-500/10 border-red-500/20',
  warning: 'bg-yellow-500/10 border-yellow-500/20',
};

const variantIconStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-green-500/20 text-green-600',
  danger: 'bg-red-500/20 text-red-600',
  warning: 'bg-yellow-500/20 text-yellow-600',
};

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  className, 
  delay = 0,
  variant = 'default'
}: StatsCardProps) => {
  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in border",
        variantStyles[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.direction === 'up' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span>{trend.percentage}%</span>
              </div>
            )}
          </div>
          <div className={cn(
            "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center",
            variantIconStyles[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
