import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Wallet, TrendingDown } from 'lucide-react';
import { GoalProgress as GoalProgressType } from '@/hooks/use-monthly-goals';

interface GoalProgressProps {
  progress: GoalProgressType;
}

export function GoalProgress({ progress }: GoalProgressProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const goals = [
    {
      label: 'Receita',
      icon: TrendingUp,
      goal: progress.revenue.goal,
      current: progress.revenue.current,
      percentage: progress.revenue.percentage,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Economia',
      icon: Wallet,
      goal: progress.savings.goal,
      current: progress.savings.current,
      percentage: progress.savings.percentage,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Investimento',
      icon: TrendingDown,
      goal: progress.investment.goal,
      current: progress.investment.current,
      percentage: progress.investment.percentage,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {goals.filter(g => g.goal > 0).map((goal) => {
        const Icon = goal.icon;
        return (
          <Card key={goal.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {goal.label}
              </CardTitle>
              <div className={`h-10 w-10 rounded-full ${goal.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${goal.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(goal.current)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de {formatCurrency(goal.goal)} ({goal.percentage.toFixed(0)}%)
                  </p>
                </div>
                <Progress value={goal.percentage} className="h-2" />
                {goal.percentage >= 100 ? (
                  <p className="text-xs font-medium text-green-600">
                    ✓ Meta alcançada!
                  </p>
                ) : goal.percentage >= 75 ? (
                  <p className="text-xs font-medium text-yellow-600">
                    Quase lá! Faltam {formatCurrency(goal.goal - goal.current)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Faltam {formatCurrency(goal.goal - goal.current)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {goals.filter(g => g.goal > 0).length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Defina suas metas para acompanhar seu progresso
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
