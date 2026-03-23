import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePDVOrders } from "@/hooks/use-pdv-orders";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
import { toast } from "sonner";
import { OrderCard } from "@/components/pdv/OrderCard";
import { OrderDetailsDialog } from "@/components/pdv/OrderDetailsDialog";
import { NewOrderDialog } from "@/components/pdv/NewOrderDialog";
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
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar apenas pedidos do balcão
  const balcaoOrders = useMemo(() => {
    let filtered = orders.filter((o) => o.source === "balcao");
    
    // Aplicar busca por número do pedido ou nome do cliente
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(query) ||
          o.customer_name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [orders, searchQuery]);

  const openOrders = useMemo(() => {
    return balcaoOrders.filter((o) => o.status === "aberta");
  }, [balcaoOrders]);

  const closedOrders = useMemo(() => {
    return balcaoOrders.filter((o) => o.status === "fechada");
  }, [balcaoOrders]);

  const getOrderItems = (orderId: string) => {
    return orderItems.filter((item) => item.order_id === orderId);
  };

  const handleCreateOrder = (customerName?: string) => {
    if (!activeSession) {
      toast.error("Abra o caixa antes de criar pedidos no balcão");
      return;
    }
    createOrder({ 
      source: "balcao",
      customer_name: customerName 
    });
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Balcão</h1>
            <p className="text-muted-foreground">
              Pedidos para retirada no balcão
            </p>
          </div>
          <Button onClick={() => setNewOrderOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número do pedido ou nome do cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
                      {searchQuery
                        ? "Nenhum pedido encontrado com os filtros aplicados"
                        : "Crie um novo pedido para começar"}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button onClick={() => setNewOrderOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Pedido
                    </Button>
                  )}
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

      <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onCreateOrder={handleCreateOrder}
        source="balcao"
      />
    </div>
  );
}
