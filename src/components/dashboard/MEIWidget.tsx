import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Calendar, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

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
  const remaining = yearlyLimit - yearlyRevenue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Data for donut chart
  const chartData = [
    { name: 'Usado', value: yearlyRevenue },
    { name: 'Disponível', value: remaining > 0 ? remaining : 0 },
  ];

  // Dynamic colors based on percentage
  const getColor = () => {
    if (limitPercentage >= 90) return 'hsl(0 84% 60%)';
    if (limitPercentage >= 80) return 'hsl(38 92% 50%)';
    return 'hsl(142 76% 36%)';
  };

  const COLORS = [getColor(), 'hsl(var(--muted))'];

  return (
    <Card 
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out 600ms forwards',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
            <Receipt className="h-4 w-4" />
          </div>
          MEI - {dasMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Donut Chart */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={42}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: getColor() }}>
                <CountUp end={limitPercentage} decimals={0} duration={1} />%
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Calendar className="h-3.5 w-3.5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencimento DAS</p>
                <p className="text-sm font-semibold">{format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Valor</span>
              <span className="text-lg font-bold text-yellow-600">
                <CountUp end={dasValue} decimals={2} decimal="," prefix="R$ " duration={1} />
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Faturamento Anual</span>
            {isNearLimit && (
              <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0 h-5 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                Atenção
              </Badge>
            )}
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-foreground">
              <CountUp end={yearlyRevenue} decimals={0} separator="." prefix="R$ " duration={1.2} />
            </span>
            <span className="text-xs text-muted-foreground">
              de {formatCurrency(yearlyLimit)}
            </span>
          </div>
        </div>

        {isNearLimit && (
          <div className={`p-3 rounded-xl border-l-4 ${limitPercentage >= 90 ? 'bg-destructive/10 border-destructive' : 'bg-yellow-500/10 border-yellow-500'}`}>
            <p className={`text-xs font-medium ${limitPercentage >= 90 ? 'text-destructive' : 'text-yellow-700 dark:text-yellow-400'}`}>
              {limitPercentage >= 90 
                ? 'Você está muito próximo do limite! Considere migrar de regime.'
                : 'Você atingiu 80% do limite anual do MEI.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
