import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeliveryOrders, useOrderStats } from "@/hooks/use-delivery-orders";
import { OrdersKanban } from "./OrdersKanban";
import { DollarSign, Package, TrendingUp } from "lucide-react";
import { useDeliveryRealtimeOrders } from "@/hooks/use-delivery-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationsPanel } from "./NotificationsPanel";

export const OrdersTab = () => {
  const { data: stats } = useOrderStats();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useDeliveryRealtimeOrders(user?.id || "", () => {
    // Invalidate orders query to refetch when new order arrives
    queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe e gerencie todos os pedidos em tempo real
          </p>
        </div>
        <NotificationsPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
        />
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
