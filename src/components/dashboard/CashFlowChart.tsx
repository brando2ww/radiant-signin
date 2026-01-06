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
  return;
};