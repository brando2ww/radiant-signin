import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Send, X, CreditCard, Utensils } from "lucide-react";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { ComandaItemCard } from "@/components/garcom/ComandaItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTableLabel } from "@/utils/formatTableNumber";

export default function GarcomComandaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    comandas,
    comandaItems,
    isLoading,
    sendToKitchen,
    closeComanda,
    removeItem,
  } = usePDVComandas();
  const { tables } = usePDVTables();

  const comanda = comandas.find((c) => c.id === id);
  const items = comandaItems.filter(
    (i) => i.comanda_id === id && !(i as any).is_composite_child,
  );
  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const tableOfComanda = comanda?.order_id
    ? tables.find((t) => t.current_order_id === comanda.order_id)
    : null;

  const pendingIds = items
    .filter((i) => i.kitchen_status === "pendente" && !i.sent_to_kitchen_at)
    .map((i) => i.id);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    );
  }

  if (!comanda) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Comanda não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 safe-area-top">
        <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold truncate">
            {comanda.customer_name || comanda.comanda_number}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{comanda.comanda_number}</p>
            {tableOfComanda ? (
              <button
                type="button"
                onClick={() => navigate(`/garcom/mesa/${tableOfComanda.id}`)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary active:scale-95 transition-transform"
              >
                <Utensils className="h-3 w-3" />
                {formatTableLabel(tableOfComanda.table_number)}
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground">· Avulsa</span>
            )}
          </div>
        </div>
      </header>

      {/* Items */}
      <div className="flex-1 p-4 pb-56 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-muted-foreground mb-4">Sem itens na comanda</p>
            <Button
              onClick={() => navigate(`/garcom/comanda/${id}/adicionar`)}
              size="lg"
              className="active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <ComandaItemCard
              key={item.id}
              productName={item.product_name}
              quantity={item.quantity}
              unitPrice={item.unit_price}
              notes={item.notes}
              kitchenStatus={item.kitchen_status}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-20 inset-x-0 z-40 border-t bg-background p-4 safe-area-bottom space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="tabular-nums">R$ {total.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="active:scale-95 h-11"
            onClick={() => navigate(`/garcom/comanda/${id}/adicionar`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Item
          </Button>
          {pendingIds.length > 0 && (
            <Button
              className="active:scale-95 h-11"
              onClick={() => {
                sendToKitchen(pendingIds);
              }}
            >
              <Send className="h-4 w-4 mr-1" />
              Cozinha
            </Button>
          )}
          <Button
            variant="secondary"
            className="active:scale-95 h-11"
            onClick={() => {
              closeComanda(comanda.id);
              navigate(-1);
            }}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
