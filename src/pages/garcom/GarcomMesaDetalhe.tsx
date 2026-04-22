import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Send } from "lucide-react";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVOrders } from "@/hooks/use-pdv-orders";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
import { ComandaItemCard } from "@/components/garcom/ComandaItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function GarcomMesaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tables, isLoading: loadingTables, updateTable } = usePDVTables();
  const {
    comandas,
    comandaItems,
    isLoading: loadingComandas,
    createComanda,
    isCreating,
    sendToKitchen,
  } = usePDVComandas();
  const { activeSession, isLoadingSession } = usePDVCashier();

  const table = tables.find((t) => t.id === id);

  // CRÍTICO: só lista comandas se a mesa tiver order_id válido.
  // Sem isso, mesas livres (current_order_id = null) acabam batendo
  // com comandas avulsas (order_id = null) e mostrando o mesmo item
  // em todas as mesas.
  const tableComandas = table?.current_order_id
    ? comandas.filter(
        (c) =>
          c.order_id === table.current_order_id && c.status === "aberta",
      )
    : [];

  const handleNewComanda = async () => {
    if (!table) return;
    if (isLoadingSession) {
      toast.info("Carregando caixa...", { position: "top-center" });
      return;
    }
    if (!activeSession) {
      toast.error("Abra o caixa antes de criar uma comanda.", { position: "top-center" });
      return;
    }
    try {
      let orderId = table.current_order_id;

      // Se a mesa ainda não tem pedido, cria agora e amarra na mesa.
      // Sem isso a comanda fica solta (order_id null) e aparece em todas
      // as mesas livres ao mesmo tempo.
      if (!orderId) {
        const orderNumber = `PDV${Date.now().toString().slice(-6)}`;
        const { data: newOrder, error: orderError } = await supabase
          .from("pdv_orders")
          .insert({
            user_id: table.user_id,
            order_number: orderNumber,
            source: "salao",
            table_id: table.id,
            status: "aberta",
            subtotal: 0,
            service_fee: 0,
            discount: 0,
            total: 0,
          })
          .select()
          .single();

        if (orderError || !newOrder) {
          toast.error("Erro ao abrir mesa: " + (orderError?.message ?? "desconhecido"));
          return;
        }

        orderId = newOrder.id;
        await new Promise<void>((resolve) => {
          updateTable(
            {
              id: table.id,
              updates: { status: "ocupada", current_order_id: orderId },
            },
            { onSettled: () => resolve() },
          );
        });
        queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      }

      const comanda = await createComanda({
        orderId,
        customerName: `Mesa ${table.table_number}`,
      });
      navigate(`/garcom/comanda/${comanda.id}`);
    } catch {
      // toast handled by hook
    }
  };

  if (loadingTables || loadingComandas) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Mesa não encontrada</p>
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
        <div>
          <h1 className="text-base font-semibold">Mesa {table.table_number}</h1>
          <p className="text-xs text-muted-foreground capitalize">{table.status.replace(/_/g, " ")}</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-24 space-y-4">
        {tableComandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma comanda aberta</p>
            <Button onClick={handleNewComanda} disabled={isCreating} size="lg" className="active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              Abrir Comanda
            </Button>
          </div>
        ) : (
          <>
            {tableComandas.map((comanda) => {
              const items = comandaItems.filter((i) => i.comanda_id === comanda.id);
              const pendingIds = items
                .filter((i) => i.kitchen_status === "pendente" && !i.sent_to_kitchen_at)
                .map((i) => i.id);

              return (
                <div key={comanda.id} className="rounded-2xl border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/garcom/comanda/${comanda.id}`)}
                      className="font-semibold text-sm active:opacity-70"
                    >
                      {comanda.comanda_number}
                      {comanda.customer_name && (
                        <span className="ml-2 text-muted-foreground font-normal">
                          — {comanda.customer_name}
                        </span>
                      )}
                    </button>
                    {pendingIds.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs active:scale-95"
                        onClick={() => {
                          sendToKitchen(pendingIds);
                        }}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Enviar ({pendingIds.length})
                      </Button>
                    )}
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem itens</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <ComandaItemCard
                          key={item.id}
                          productName={item.product_name}
                          quantity={item.quantity}
                          unitPrice={item.unit_price}
                          notes={item.notes}
                          kitchenStatus={item.kitchen_status}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Button
              onClick={handleNewComanda}
              disabled={isCreating}
              variant="outline"
              className="w-full active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Comanda
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
