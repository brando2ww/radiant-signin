import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryMetrics } from "@/hooks/use-delivery-reports";
import { TrendingUp, ShoppingBag, DollarSign, Package, XCircle, Truck, Home } from "lucide-react";
import { formatBRL } from "@/lib/format";

interface DeliveryMetricsProps {
  metrics: DeliveryMetrics;
}

export const DeliveryMetricsCards = ({ metrics }: DeliveryMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.completedOrders} concluídos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBRL(metrics.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Ticket médio: {formatBRL(metrics.averageTicket)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Delivery</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.deliveryOrders}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalOrders > 0 
              ? ((metrics.deliveryOrders / metrics.totalOrders) * 100).toFixed(1)
              : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retiradas no Local</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pickupOrders}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalOrders > 0 
              ? ((metrics.pickupOrders / metrics.totalOrders) * 100).toFixed(1)
              : 0}% do total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
