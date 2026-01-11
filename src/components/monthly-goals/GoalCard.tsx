import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit2, Trash2, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { MonthlyGoal, GoalProgress } from '@/hooks/use-monthly-goals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalCardProps {
  goal: MonthlyGoal;
  progress?: GoalProgress | null;
  isCurrentMonth: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({
  goal,
  progress,
  isCurrentMonth,
  onEdit,
  onDelete,
}: GoalCardProps) {
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

  const goals = [
    {
      label: 'Receita',
      value: goal.revenue_goal,
      current: progress?.revenue.current || 0,
      percentage: progress?.revenue.percentage || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Economia',
      value: goal.savings_goal,
      current: progress?.savings.current || 0,
      percentage: progress?.savings.percentage || 0,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Investimento',
      value: goal.investment_goal,
      current: progress?.investment.current || 0,
      percentage: progress?.investment.percentage || 0,
      icon: PiggyBank,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ].filter(g => g.value && g.value > 0);

  return (
    <Card className={isCurrentMonth ? 'ring-2 ring-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isCurrentMonth && (
                <Badge variant="default" className="text-xs">
                  Atual
                </Badge>
              )}
              {!isCurrentMonth && (
                <Badge variant="outline" className="text-xs">
                  Futuro
                </Badge>
              )}
            </div>
            <h3 className="font-semibold capitalize">
              {formatMonthYear(goal.month_year)}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goalItem) => {
          const Icon = goalItem.icon;
          return (
            <div key={goalItem.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full ${goalItem.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-3 w-3 ${goalItem.color}`} />
                  </div>
                  <span className="font-medium">{goalItem.label}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatCurrency(goalItem.value)}
                </span>
              </div>
              {isCurrentMonth && (
                <>
                  <Progress value={goalItem.percentage} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(goalItem.current)} atual</span>
                    <span>{goalItem.percentage.toFixed(0)}%</span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhuma meta definida
          </p>
        )}
      </CardContent>
    </Card>
  );
}
