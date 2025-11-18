import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { MonthlyGoal } from '@/hooks/use-monthly-goals';

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
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum histórico de metas ainda</p>
            <p className="text-xs mt-1">Comece definindo suas metas mensais</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Histórico de Metas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const hasGoals = goal.revenue_goal || goal.savings_goal || goal.investment_goal;
            const currentMonth = new Date().toISOString().slice(0, 7);
            const isCurrent = goal.month_year === currentMonth;
            const isPast = goal.month_year < currentMonth;

            return (
              <div
                key={goal.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isPast ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatMonthYear(goal.month_year)}</p>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hasGoals ? 'Metas definidas' : 'Sem metas'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {goal.revenue_goal && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Receita: </span>
                      <span className="font-medium">{formatCurrency(goal.revenue_goal)}</span>
                    </div>
                  )}
                  {goal.savings_goal && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Economia: </span>
                      <span className="font-medium">{formatCurrency(goal.savings_goal)}</span>
                    </div>
                  )}
                  {goal.investment_goal && (
                    <div className="text-sm">
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
