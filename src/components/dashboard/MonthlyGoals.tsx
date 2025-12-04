import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import CountUp from 'react-countup';

interface MonthlyGoalsProps {
  revenueGoal: number;
  currentRevenue: number;
  savingsGoal: number;
  currentSavings: number;
  investmentGoal: number;
  currentInvestment: number;
}

// Circular Progress Component
const CircularProgress = ({ 
  percentage, 
  color, 
  size = 80,
  strokeWidth = 8 
}: { 
  percentage: number; 
  color: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="transition-all duration-1000 ease-out"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          <CountUp end={percentage} decimals={0} duration={1.2} />%
        </span>
      </div>
    </div>
  );
};

export const MonthlyGoals = ({
  revenueGoal,
  currentRevenue,
  savingsGoal,
  currentSavings,
  investmentGoal,
  currentInvestment,
}: MonthlyGoalsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculatePercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const goals = [
    {
      label: 'Receita',
      current: currentRevenue,
      goal: revenueGoal,
      color: 'hsl(142 76% 36%)',
    },
    {
      label: 'Economia',
      current: currentSavings,
      goal: savingsGoal,
      color: 'hsl(217 91% 60%)',
    },
    {
      label: 'Investimento',
      current: currentInvestment,
      goal: investmentGoal,
      color: 'hsl(280 70% 50%)',
    },
  ];

  return (
    <Card 
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out 700ms forwards',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
            <Target className="h-4 w-4" />
          </div>
          Metas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around items-center">
          {goals.map((goal, index) => {
            const percentage = calculatePercentage(goal.current, goal.goal);
            return (
              <div 
                key={goal.label} 
                className="flex flex-col items-center text-center group"
                style={{ 
                  animationDelay: `${800 + index * 100}ms`
                }}
              >
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <CircularProgress 
                    percentage={percentage} 
                    color={goal.color}
                    size={70}
                    strokeWidth={6}
                  />
                </div>
                <p className="text-xs font-semibold mt-2 text-foreground">{goal.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatCurrency(goal.current)}/{formatCurrency(goal.goal)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
