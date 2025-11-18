import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';

interface CreditCardsAnalysisProps {
  creditCards: any[];
  summary: {
    totalCreditCardDebt: number;
    totalCreditLimit: number;
    creditUsagePercentage: number;
  };
}

export const CreditCardsAnalysis = ({ creditCards, summary }: CreditCardsAnalysisProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-destructive';
    if (percentage >= 50) return 'text-warning';
    return 'text-success';
  };

  const getUsageBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-destructive';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fatura Total</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalCreditCardDebt)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Limite Total</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalCreditLimit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Uso do Limite</p>
                <p className={`text-2xl font-bold ${getUsageColor(summary.creditUsagePercentage)}`}>
                  {summary.creditUsagePercentage.toFixed(1)}%
                </p>
              </div>
              {summary.creditUsagePercentage >= 80 && (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Cartão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creditCards.map((card) => {
            const usage = card.credit_limit > 0
              ? (Number(card.current_balance) / Number(card.credit_limit)) * 100
              : 0;
            
            const available = Number(card.credit_limit || 0) - Number(card.current_balance || 0);

            return (
              <div key={card.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{card.name}</h4>
                    {usage >= 80 && (
                      <Badge variant="destructive">Alto uso</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Vence dia {card.due_day}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fatura Atual</span>
                  <span className="font-semibold">{formatCurrency(Number(card.current_balance || 0))}</span>
                </div>

                <Progress 
                  value={usage} 
                  className={`h-2 ${getUsageBgColor(usage)}`}
                />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Disponível: {formatCurrency(available)}
                  </span>
                  <span className={getUsageColor(usage)}>
                    {usage.toFixed(1)}% usado
                  </span>
                </div>
              </div>
            );
          })}

          {creditCards.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cartão de crédito cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
