import { CalendarEvent } from '@/hooks/use-calendar-events';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MonthSummaryProps {
  events: CalendarEvent[];
}

export const MonthSummary = ({ events }: MonthSummaryProps) => {
  const totalIncome = events
    .filter((e) => e.type === 'bill' && e.description?.includes('receber'))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpenses = events
    .filter((e) => 
      (e.type === 'bill' && e.description?.includes('pagar')) || 
      e.type === 'card_due'
    )
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const overdueCount = events.filter((e) => e.status === 'overdue').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Receitas Previstas</p>
            <p className="text-xl font-bold text-success">
              R$ {totalIncome.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesas Previstas</p>
            <p className="text-xl font-bold text-destructive">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Eventos Atrasados</p>
            <p className="text-xl font-bold text-warning">
              {overdueCount}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
