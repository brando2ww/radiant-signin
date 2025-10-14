import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MonthlyGoalsProps {
  revenueGoal: number;
  currentRevenue: number;
  savingsGoal: number;
  currentSavings: number;
  investmentGoal: number;
  currentInvestment: number;
}

export const MonthlyGoals = ({
  revenueGoal,
  currentRevenue,
  savingsGoal,
  currentSavings,
  investmentGoal,
  currentInvestment,
}: MonthlyGoalsProps) => {
  const formatCurrency = (value: number) => {
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
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      label: 'Economia',
      current: currentSavings,
      goal: savingsGoal,
      icon: '🏦',
      color: 'bg-blue-500',
    },
    {
      label: 'Investimento',
      current: currentInvestment,
      goal: investmentGoal,
      icon: '📈',
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Metas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const percentage = calculatePercentage(goal.current, goal.goal);
          return (
            <div key={goal.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span>{goal.icon}</span>
                  {goal.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(goal.current)} / {formatCurrency(goal.goal)}
                </span>
              </div>
              <div className="space-y-1">
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {percentage.toFixed(0)}%
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
