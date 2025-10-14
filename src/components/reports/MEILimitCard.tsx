import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp } from 'lucide-react';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limite Anual MEI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Faturamento Anual</span>
            <span className="text-2xl font-bold">{formatCurrency(yearlyRevenue)}</span>
          </div>
          <div className="flex justify-between items-center mb-3 text-sm text-muted-foreground">
            <span>de {formatCurrency(yearlyLimit)}</span>
            <span>{percentageUsed.toFixed(1)}% utilizado</span>
          </div>
          <Progress value={percentageUsed} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Faturado no Ano</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(yearlyRevenue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Disponível</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(yearlyLimit - yearlyRevenue)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold">Projeção para o Ano</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(projectedYearlyRevenue)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Baseado na média mensal atual
          </p>
        </div>

        {isNearLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Atenção! Você já utilizou {percentageUsed.toFixed(1)}% do limite anual do MEI.
            </AlertDescription>
          </Alert>
        )}

        {willExceedLimit && !isNearLimit && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sua projeção indica que você pode ultrapassar o limite anual. Considere planejar a transição para ME.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
