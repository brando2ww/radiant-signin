import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { MonthlyGoal } from '@/hooks/use-monthly-goals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalHistoryProps {
  goals: MonthlyGoal[];
}

export function GoalHistory({ goals }: GoalHistoryProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy', { locale: ptBR });
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {goals.map((goal) => {
            const hasGoals = goal.revenue_goal || goal.savings_goal || goal.investment_goal;

            return (
              <div
                key={goal.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-2"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-medium capitalize">{formatMonthYear(goal.month_year)}</p>
                    <p className="text-xs text-muted-foreground">
                      {hasGoals ? 'Metas concluídas' : 'Sem metas'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm ml-8 sm:ml-0">
                  {goal.revenue_goal && (
                    <div>
                      <span className="text-muted-foreground">Receita: </span>
                      <span className="font-medium">{formatCurrency(goal.revenue_goal)}</span>
                    </div>
                  )}
                  {goal.savings_goal && (
                    <div>
                      <span className="text-muted-foreground">Economia: </span>
                      <span className="font-medium">{formatCurrency(goal.savings_goal)}</span>
                    </div>
                  )}
                  {goal.investment_goal && (
                    <div>
                      <span className="text-muted-foreground">Investimento: </span>
                      <span className="font-medium">{formatCurrency(goal.investment_goal)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
