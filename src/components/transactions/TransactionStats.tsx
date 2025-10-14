import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeTrend: number;
  expenseTrend: number;
  balanceTrend: number;
}

export const TransactionStats = ({
  totalIncome,
  totalExpense,
  balance,
  incomeTrend,
  expenseTrend,
  balanceTrend,
}: TransactionStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTrend = (value: number) => {
    const formatted = Math.abs(value).toFixed(1);
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Receitas */}
      <Card className="animate-fade-in border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                incomeTrend >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {incomeTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatTrend(incomeTrend)} vs mês anterior
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card className="animate-fade-in border-l-4 border-l-red-500" style={{ animationDelay: '100ms' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                expenseTrend <= 0 ? "text-green-600" : "text-red-600"
              )}>
                {expenseTrend <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {formatTrend(expenseTrend)} vs mês anterior
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balanço */}
      <Card className="animate-fade-in border-l-4 border-l-primary" style={{ animationDelay: '200ms' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Balanço</p>
              <p className={cn(
                "text-2xl font-bold",
                balance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(balance)}
              </p>
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                balanceTrend >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {balanceTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatTrend(balanceTrend)} vs mês anterior
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
