import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryData } from '@/hooks/use-reports';

interface CategoryDistributionChartProps {
  data: CategoryData[];
  title: string;
  colors?: string[];
}

const COLORS = [
  'hsl(142, 71%, 45%)',
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 84%, 60%)',
  'hsl(25, 95%, 53%)',
  'hsl(48, 96%, 53%)',
  'hsl(173, 80%, 40%)',
  'hsl(339, 82%, 52%)',
];

export const CategoryDistributionChart = ({
  data,
  title,
  colors = COLORS,
}: CategoryDistributionChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
