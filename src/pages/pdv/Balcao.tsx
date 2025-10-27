import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag } from "lucide-react";
import { usePDVOrders } from "@/hooks/use-pdv-orders";
import { OrderCard } from "@/components/pdv/OrderCard";
import { OrderDetailsDialog } from "@/components/pdv/OrderDetailsDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PDVBalcao() {
  const {
    orders,
    orderItems,
    isLoading,
    createOrder,
    updateItem,
    removeItem,
    addItem,
    closeOrder,
    cancelOrder,
  } = usePDVOrders();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filtrar apenas pedidos do balcão
  const balcaoOrders = useMemo(() => {
    return orders.filter((o) => o.source === "balcao");
  }, [orders]);

  const openOrders = useMemo(() => {
    return balcaoOrders.filter((o) => o.status === "aberta");
  }, [balcaoOrders]);

  const closedOrders = useMemo(() => {
    return balcaoOrders.filter((o) => o.status === "fechada");
  }, [balcaoOrders]);

  const getOrderItems = (orderId: string) => {
    return orderItems.filter((item) => item.order_id === orderId);
  };

  const handleCreateOrder = () => {
    createOrder({ source: "balcao" });
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleUpdateItem = (id: string, updates: Partial<any>) => {
    updateItem({ id, updates });
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleAddItem = (item: any) => {
    addItem(item);
  };

  const handleCloseOrder = (id: string) => {
    closeOrder(id);
  };

  const handleCancelOrder = (id: string, reason: string) => {
    cancelOrder({ id, reason });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balcão</h1>
          <p className="text-muted-foreground">
            Pedidos para retirada no balcão
          </p>
        </div>
        <Button onClick={handleCreateOrder}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            Abertas ({openOrders.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Finalizadas ({closedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-6">
          {openOrders.length === 0 ? (
            <Card>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">
                      Nenhum pedido aberto
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Crie um novo pedido para começar
                    </p>
                  </div>
                  <Button onClick={handleCreateOrder}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  itemCount={getOrderItems(order.id).length}
                  onView={handleViewOrder}
                  onClose={handleCloseOrder}
                  onCancel={(id) => handleCancelOrder(id, "Cancelado pelo operador")}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-6">
          {closedOrders.length === 0 ? (
            <Card>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">
                      Nenhum pedido finalizado
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pedidos finalizados aparecerão aqui
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  itemCount={getOrderItems(order.id).length}
                  onView={handleViewOrder}
                  onClose={handleCloseOrder}
                  onCancel={(id) => handleCancelOrder(id, "Cancelado")}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <OrderDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrder}
        items={selectedOrder ? getOrderItems(selectedOrder.id) : []}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onAddItem={handleAddItem}
        onClose={handleCloseOrder}
        onCancel={handleCancelOrder}
      />
    </div>
  );
}
