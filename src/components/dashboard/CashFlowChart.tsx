import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
interface CashFlowChartProps {
  data: Array<{
    month: string;
    receitas: number;
    despesas: number;
    lucro: number;
  }>;
}
export const CashFlowChart = ({
  data
}: CashFlowChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis tickFormatter={formatCurrency} className="text-xs" />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Area type="monotone" dataKey="receitas" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Receitas" />
            <Area type="monotone" dataKey="despesas" stackId="2" stroke="#eab308" fill="#eab308" fillOpacity={0.3} name="Despesas" />
            <Area type="monotone" dataKey="lucro" stackId="3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Lucro" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};