import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDVOrder, PDVOrderItem } from "@/hooks/use-pdv-orders";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddItemDialog } from "./AddItemDialog";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PDVOrder | null;
  items: PDVOrderItem[];
  onUpdateItem: (id: string, updates: Partial<PDVOrderItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (item: any) => void;
  onClose: (id: string) => void;
  onCancel: (id: string, reason: string) => void;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onClose,
  onCancel,
}: OrderDetailsDialogProps) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!order) return null;

  const handleQuantityChange = (item: PDVOrderItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) return;
    
    const newSubtotal = newQuantity * item.unit_price;
    onUpdateItem(item.id, { quantity: newQuantity, subtotal: newSubtotal });
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      return;
    }
    onCancel(order.id, cancelReason);
    setCancelDialog(false);
    setCancelReason("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Pedido #{order.order_number}</DialogTitle>
              <Badge variant={order.status === "aberta" ? "default" : "secondary"}>
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Aberto às {format(parseISO(order.opened_at), "HH:mm", { locale: ptBR })}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informações do pedido */}
            {order.customer_name && (
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
            )}

            <Separator />

            {/* Itens */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Itens do Pedido</h3>
                {order.status === "aberta" && (
                  <Button size="sm" onClick={() => setAddItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item no pedido
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          R$ {item.unit_price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "aberta" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <span className="font-bold w-20 text-right">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Totais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {order.subtotal.toFixed(2)}</span>
              </div>
              {order.service_fee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxa de serviço</span>
                  <span>R$ {order.service_fee.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-destructive">
                    - R$ {order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Ações */}
            {order.status === "aberta" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancelDialog(true)}
                >
                  Cancelar Pedido
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    onClose(order.id);
                    onOpenChange(false);
                  }}
                >
                  Fechar Pedido
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        orderId={order?.id || ""}
        onAddItem={(item) => {
          onAddItem(item);
          setAddItemOpen(false);
        }}
      />

      <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo do cancelamento:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            className="w-full min-h-[100px] p-3 border rounded-md"
            placeholder="Motivo do cancelamento..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
