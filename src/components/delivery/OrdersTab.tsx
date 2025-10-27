import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeliveryOrders, useOrderStats } from "@/hooks/use-delivery-orders";
import { OrdersKanban } from "./OrdersKanban";
import { DollarSign, Package, TrendingUp } from "lucide-react";

export const OrdersTab = () => {
  const { data: stats } = useOrderStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciar Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie todos os pedidos em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Pedidos Hoje
                </p>
                <p className="text-2xl font-bold">{stats?.todayTotal || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Receita Hoje
                </p>
                <p className="text-2xl font-bold">
                  R$ {(stats?.todayRevenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </p>
                <p className="text-2xl font-bold">
                  R${" "}
                  {stats?.todayTotal
                    ? ((stats.todayRevenue || 0) / stats.todayTotal).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <OrdersKanban />
    </div>
  );
};
