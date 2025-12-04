import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const TransactionStats = ({
  totalIncome,
  totalExpense,
  balance,
}: TransactionStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 sm:gap-4 md:gap-4 grid-cols-1 md:grid-cols-3 mb-4 md:mb-6">
      {/* Receitas */}
      <Card className="animate-fade-in border-l-4 border-l-green-500">
        <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Receitas</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card className="animate-fade-in border-l-4 border-l-red-500" style={{ animationDelay: '100ms' }}>
        <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Despesas</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balanço */}
      <Card className="animate-fade-in border-l-4 border-l-primary" style={{ animationDelay: '200ms' }}>
        <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Balanço</p>
              <p className={cn(
                "text-xl md:text-2xl font-bold",
                balance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
