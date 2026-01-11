import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface MEILimitCardProps {
  yearlyRevenue: number;
  yearlyLimit: number;
  percentageUsed: number;
  projectedYearlyRevenue: number;
}

export const MEILimitCard = ({
  yearlyRevenue,
  yearlyLimit,
  percentageUsed,
  projectedYearlyRevenue,
}: MEILimitCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isNearLimit = percentageUsed >= 80;
  const willExceedLimit = projectedYearlyRevenue > yearlyLimit;
  const available = yearlyLimit - yearlyRevenue;
  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          Limite Anual MEI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Faturamento {currentYear}</span>
            <span className="font-semibold text-sm sm:text-base">{formatCurrency(yearlyRevenue)}</span>
          </div>
          <Progress value={Math.min(percentageUsed, 100)} className="h-2 sm:h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{percentageUsed.toFixed(1)}% utilizado</span>
            <span>Limite: {formatCurrency(yearlyLimit)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Faturado no Ano</p>
            <p className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(yearlyRevenue)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Disponível</p>
            <p className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(Math.max(available, 0))}
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm sm:text-base">Projeção para o Ano</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold">{formatCurrency(projectedYearlyRevenue)}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Baseado na média mensal atual
          </p>
        </div>

        {yearlyRevenue === 0 && (
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              Nenhuma receita registrada em {currentYear}. As receitas do tipo "Receita" serão contabilizadas automaticamente.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && yearlyRevenue > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Atenção! Você já utilizou {percentageUsed.toFixed(1)}% do limite anual do MEI.
            </AlertDescription>
          </Alert>
        )}

        {willExceedLimit && !isNearLimit && yearlyRevenue > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
              Sua projeção indica que você pode ultrapassar o limite anual. Considere planejar a transição para ME.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
