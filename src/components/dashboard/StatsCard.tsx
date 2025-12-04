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
  variant?: 'default' | 'revenue' | 'expense' | 'profit';
}

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  className, 
  delay = 0,
  variant = 'default' 
}: StatsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'revenue':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50';
      case 'expense':
        return 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200/50';
      case 'profit':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50';
      default:
        return 'bg-card border-border';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'revenue':
        return 'bg-emerald-500 text-white shadow-emerald-200';
      case 'expense':
        return 'bg-rose-500 text-white shadow-rose-200';
      case 'profit':
        return 'bg-yellow-500 text-white shadow-yellow-200';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        getVariantStyles(),
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'fade-slide-in 0.5s ease-out forwards',
        opacity: 0 
      }}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl shadow-lg",
            getIconStyles()
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground truncate">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs font-medium",
                trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
              )}>
                {trend.direction === 'up' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                <span>{trend.percentage}% vs mês anterior</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
