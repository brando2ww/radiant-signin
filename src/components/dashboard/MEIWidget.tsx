import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';

interface MEIWidgetProps {
  dasValue: number;
  dasMonth: string;
  dueDate: Date;
  yearlyRevenue: number;
  yearlyLimit: number;
}

export const MEIWidget = ({ dasValue, dasMonth, dueDate, yearlyRevenue, yearlyLimit }: MEIWidgetProps) => {
  const limitPercentage = (yearlyRevenue / yearlyLimit) * 100;
  const isNearLimit = limitPercentage >= 80;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📅 MEI - {dasMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor do DAS</span>
            <span className="font-bold text-lg">{formatCurrency(dasValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Vencimento</span>
            <span className="font-medium">{format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Faturamento Anual</span>
            {isNearLimit && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Atenção
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{formatCurrency(yearlyRevenue)}</span>
              <span className="text-muted-foreground">
                de {formatCurrency(yearlyLimit)}
              </span>
            </div>
            <Progress value={limitPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {limitPercentage.toFixed(1)}% do limite
            </p>
          </div>
        </div>

        {isNearLimit && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-xs text-destructive font-medium">
              Você atingiu mais de 80% do limite anual do MEI. Considere migrar para outro regime tributário.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
