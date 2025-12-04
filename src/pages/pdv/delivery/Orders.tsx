import { OrdersTab } from "@/components/delivery/OrdersTab";

export default function DeliveryOrders() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pedidos Delivery</h1>
        <p className="text-muted-foreground">Gerencie os pedidos do delivery</p>
      </div>
      <OrdersTab />
    </div>
  );
}
