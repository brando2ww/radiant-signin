import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive?: boolean;
  };
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger';
}

export const KPICard = ({ title, value, icon, change, subtitle, variant = 'default' }: KPICardProps) => {
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                change.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {change.isPositive ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span>{Math.abs(change.value).toFixed(1)}%</span>
                <span className="text-xs text-muted-foreground ml-1">vs. período anterior</span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            variantClasses[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
