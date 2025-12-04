import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  variant: 'revenue' | 'expense' | 'profit';
  delay?: number;
}

export const StatsCard = ({ title, value, icon, variant, delay = 0 }: StatsCardProps) => {
  const variantStyles = {
    revenue: {
      gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      iconShadow: 'shadow-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
    },
    expense: {
      gradient: 'from-rose-500/10 via-rose-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600',
      iconShadow: 'shadow-rose-500/30',
      textColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-200/50 dark:border-rose-800/30',
    },
    profit: {
      gradient: 'from-yellow-500/10 via-yellow-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      iconShadow: 'shadow-yellow-500/30',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200/50 dark:border-yellow-800/30',
    },
  };

  const style = variantStyles[variant];
  
  // Parse the currency value for CountUp
  const numericValue = parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group",
        style.borderColor,
        `bg-gradient-to-br ${style.gradient}`
      )}
      style={{ 
        animation: `fade-slide-in 0.5s ease-out ${delay}ms forwards`,
        opacity: 0 
      }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />
      
      <CardContent className="relative z-10 p-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300",
            style.iconBg,
            style.iconShadow
          )}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className={cn("text-xl md:text-2xl font-bold tracking-tight", style.textColor)}>
              R${' '}
              <CountUp
                end={Math.abs(numericValue)}
                decimals={0}
                separator="."
                duration={1.2}
                preserveValue
              />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
