import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryMetrics } from "@/hooks/use-delivery-reports";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OrdersAnalysisProps {
  metrics: DeliveryMetrics;
}

const COLORS = {
  completed: "hsl(var(--chart-1))",
  cancelled: "hsl(var(--chart-5))",
  delivery: "hsl(var(--chart-2))",
  pickup: "hsl(var(--chart-3))",
};

export const OrdersAnalysis = ({ metrics }: OrdersAnalysisProps) => {
  const statusData = [
    { name: "Concluídos", value: metrics.completedOrders, color: COLORS.completed },
    { name: "Cancelados", value: metrics.cancelledOrders, color: COLORS.cancelled },
  ];

  const typeData = [
    { name: "Delivery", value: metrics.deliveryOrders, color: COLORS.delivery },
    { name: "Retirada", value: metrics.pickupOrders, color: COLORS.pickup },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Status dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.totalOrders === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum pedido no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.totalOrders === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum pedido no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
