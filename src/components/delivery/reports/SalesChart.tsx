import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailySales } from "@/hooks/use-delivery-reports";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesChartProps {
  data: DailySales[];
}

export const SalesChart = ({ data }: SalesChartProps) => {
  const chartData = data.map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="dateFormatted" 
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "revenue") return `R$ ${value.toFixed(2)}`;
                return value;
              }}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="orders" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Pedidos"
              dot={{ fill: "hsl(var(--primary))" }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="Receita (R$)"
              dot={{ fill: "hsl(var(--chart-2))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
