import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Package } from "lucide-react";
import { DeliveryOrder } from "@/hooks/use-delivery-orders";
import { useState } from "react";
import { OrderDetailDialog } from "./OrderDetailDialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderCardProps {
  order: DeliveryOrder;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = order.customer_phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}`, "_blank");
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${order.customer_phone}`, "_blank");
  };

  const timeAgo = formatDistanceToNow(new Date(order.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-sm">{order.order_number}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            <Badge variant={order.order_type === "delivery" ? "default" : "secondary"}>
              {order.order_type === "delivery" ? (
                <MapPin className="h-3 w-3 mr-1" />
              ) : (
                <Package className="h-3 w-3 mr-1" />
              )}
              {order.order_type === "delivery" ? "Delivery" : "Retirada"}
            </Badge>
          </div>

          {/* Customer */}
          <div>
            <p className="font-medium text-sm truncate">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
          </div>

          {/* Items Summary */}
          {order.delivery_order_items && (
            <div className="text-xs text-muted-foreground">
              {order.delivery_order_items.length} item(s)
              <div className="mt-1 space-y-0.5">
                {order.delivery_order_items.slice(0, 2).map((item) => (
                  <div key={item.id}>
                    {item.quantity}x {item.product_name}
                  </div>
                ))}
                {order.delivery_order_items.length > 2 && (
                  <div className="text-muted-foreground/70">
                    +{order.delivery_order_items.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="font-bold">R$ {Number(order.total).toFixed(2)}</p>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleWhatsApp}
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Estimated Time */}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{order.estimated_time} min</span>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={order}
      />
    </>
  );
};
