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
export const MEIWidget = ({
  dasValue,
  dasMonth,
  dueDate,
  yearlyRevenue,
  yearlyLimit
}: MEIWidgetProps) => {
  const limitPercentage = yearlyRevenue / yearlyLimit * 100;
  const isNearLimit = limitPercentage >= 80;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">MEI - DAS</CardTitle>
          {isNearLimit && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Atenção
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">DAS - {dasMonth}</span>
            <span className="font-medium">{formatCurrency(dasValue)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Vencimento</span>
            <span className="font-medium">
              {format(dueDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Faturamento anual</span>
            <span className="font-medium">{formatCurrency(yearlyRevenue)}</span>
          </div>
          <Progress value={limitPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{limitPercentage.toFixed(1)}% do limite</span>
            <span>Limite: {formatCurrency(yearlyLimit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};