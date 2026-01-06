import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
interface RevenueCategory {
  name: string;
  value: number;
  color: string;
}
interface RevenueByCategoryChartProps {
  data: RevenueCategory[];
}
export const RevenueByCategoryChart = ({
  data
}: RevenueByCategoryChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return;
};