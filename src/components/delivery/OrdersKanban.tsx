import { useDeliveryOrders } from "@/hooks/use-delivery-orders";
import { OrderCard } from "./OrderCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusColumns = [
  { id: "pending", label: "Novos", color: "bg-yellow-500" },
  { id: "confirmed", label: "Confirmados", color: "bg-blue-500" },
  { id: "preparing", label: "Preparando", color: "bg-orange-500" },
  { id: "ready", label: "Prontos", color: "bg-purple-500" },
  { id: "delivering", label: "Saiu para Entrega", color: "bg-indigo-500" },
  { id: "completed", label: "Concluídos", color: "bg-green-500" },
];

export const OrdersKanban = () => {
  const { data: allOrders = [] } = useDeliveryOrders();

  const getOrdersByStatus = (status: string) => {
    return allOrders.filter((order) => order.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statusColumns.map((column) => {
        const orders = getOrdersByStatus(column.id);
        
        return (
          <Card key={column.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${column.color}`} />
                  {column.label}
                </span>
                <Badge variant="secondary">{orders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-2 pr-3">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhum pedido
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
