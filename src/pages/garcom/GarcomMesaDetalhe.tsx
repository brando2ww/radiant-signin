import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Send } from "lucide-react";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
import { ComandaItemCard } from "@/components/garcom/ComandaItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const tableComandas = table?.current_order_id
    ? comandas.filter(
        (c) =>
          c.order_id === table.current_order_id && c.status === "aberta",
      )
    : [];

  const [splitOpen, setSplitOpen] = useState(false);
  const [splitName, setSplitName] = useState("");
  const [opening, setOpening] = useState(false);
  const ensuringRef = useRef(false);

  const hasDefaultComanda = tableComandas.some((c) => !c.customer_name);

  // Se já existe pelo menos uma comanda padrão, redireciona direto pra ela
  // (continuação de atendimento, sem confirmação).
  useEffect(() => {
    if (loadingTables || loadingComandas) return;
    if (!table) return;
    if (splitOpen) return;
    if (tableComandas.length === 1) {
      navigate(`/garcom/comanda/${tableComandas[0].id}`, { replace: true });
    }
  }, [tableComandas, loadingTables, loadingComandas, table, splitOpen, navigate]);

  const handleConfirmOpen = async () => {
    if (!table) return;
    if (ensuringRef.current) return;
    ensuringRef.current = true;
    setOpening(true);
    try {
      let orderId = table.current_order_id;

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
          toast.error(
            "Erro ao abrir mesa: " + (orderError?.message ?? "desconhecido"),
          );
          ensuringRef.current = false;
          setOpening(false);
          return;
        }
        orderId = newOrder.id;
      }

      if (
        table.status !== "ocupada" ||
        table.current_order_id !== orderId
      ) {
        // Fire-and-forget
        updateTable({
          id: table.id,
          updates: { status: "ocupada", current_order_id: orderId },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });

      const comanda = await createComanda({ orderId });
      navigate(`/garcom/comanda/${comanda.id}`, { replace: true });
    } catch {
      ensuringRef.current = false;
      setOpening(false);
    }
  };

  const handleCancelOpen = () => {
    navigate(-1);
  };

  const handleCreateNominal = async () => {
    const name = splitName.trim();
    if (!name) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (!table?.current_order_id) return;
    try {
      const comanda = await createComanda({
        orderId: table.current_order_id,
        customerName: name,
      });
      setSplitOpen(false);
      setSplitName("");
      navigate(`/garcom/comanda/${comanda.id}`);
    } catch {
      // toast tratado no hook
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

  const blockedNoCashier = !activeSession && !isLoadingSession;
  const showConfirmDialog =
    !hasDefaultComanda && !blockedNoCashier && !opening && !!activeSession;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 safe-area-top">
        <button
          onClick={() => navigate(-1)}
          className="active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold">Mesa {table.table_number}</h1>
          <p className="text-xs text-muted-foreground capitalize">
            {table.status.replace(/_/g, " ")}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-24 space-y-4">
        {blockedNoCashier ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-2">
              Caixa fechado — abra o caixa para iniciar atendimento.
            </p>
          </div>
        ) : tableComandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {opening ? (
              <p className="text-muted-foreground">Abrindo comanda...</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Mesa livre
              </p>
            )}
          </div>
        ) : (
          <>
            {tableComandas.map((comanda) => {
              const items = comandaItems.filter(
                (i) => i.comanda_id === comanda.id,
              );
              const pendingIds = items
                .filter(
                  (i) =>
                    i.kitchen_status === "pendente" && !i.sent_to_kitchen_at,
                )
                .map((i) => i.id);

              const label = comanda.customer_name
                ? comanda.customer_name
                : `Mesa ${table.table_number}`;

              return (
                <div
                  key={comanda.id}
                  className="rounded-2xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/garcom/comanda/${comanda.id}`)}
                      className="font-semibold text-sm active:opacity-70 text-left"
                    >
                      {comanda.comanda_number}
                      <span className="ml-2 text-muted-foreground font-normal">
                        — {label}
                      </span>
                    </button>
                    {pendingIds.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs active:scale-95"
                        onClick={() => sendToKitchen(pendingIds)}
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
              onClick={() => setSplitOpen(true)}
              disabled={isCreating}
              variant="outline"
              className="w-full active:scale-95"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Dividir em comanda nominal
            </Button>
          </>
        )}
      </div>

      {/* Confirmação de abertura de mesa livre */}
      <AlertDialog open={showConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abrir Mesa {table.table_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai iniciar uma nova comanda nesta mesa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelOpen}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOpen} disabled={opening}>
              Abrir mesa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova comanda nominal</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do cliente</label>
            <Input
              autoFocus
              value={splitName}
              onChange={(e) => setSplitName(e.target.value)}
              placeholder="Ex: João"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateNominal();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Útil quando o cliente pede para dividir a conta.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateNominal} disabled={isCreating}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
