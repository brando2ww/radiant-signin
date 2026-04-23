import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Send, Plus, X } from "lucide-react";
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
  const [comandaNames, setComandaNames] = useState<string[]>([""]);
  const ensuringRef = useRef(false);

  const hasOpenComandas = tableComandas.length > 0;

  // Se já existe alguma comanda aberta, e há exatamente UMA, redireciona direto.
  // (continuação de atendimento de mesa pré-existente)
  useEffect(() => {
    if (loadingTables || loadingComandas) return;
    if (!table) return;
    if (splitOpen) return;
    if (opening) return;
    if (tableComandas.length === 1) {
      navigate(`/garcom/comanda/${tableComandas[0].id}`, { replace: true });
    }
  }, [tableComandas, loadingTables, loadingComandas, table, splitOpen, opening, navigate]);

  const handleConfirmOpen = async () => {
    if (!table) return;
    if (ensuringRef.current) return;
    const names = comandaNames.map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) {
      toast.error("Informe ao menos um nome de comanda");
      return;
    }
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
        updateTable({
          id: table.id,
          updates: { status: "ocupada", current_order_id: orderId },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });

      const created = [];
      for (const name of names) {
        const c = await createComanda({ orderId, customerName: name });
        created.push(c);
      }

      setComandaNames([""]);
      ensuringRef.current = false;
      setOpening(false);

      if (created.length === 1) {
        navigate(`/garcom/comanda/${created[0].id}`, { replace: true });
      }
      // Se 2+, fica na tela da mesa mostrando a lista (já vai re-renderizar).
    } catch {
      ensuringRef.current = false;
      setOpening(false);
    }
  };

  const handleCancelOpen = () => {
    navigate(-1);
  };

  const updateName = (index: number, value: string) => {
    setComandaNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addNameField = () => {
    setComandaNames((prev) => (prev.length >= 10 ? prev : [...prev, ""]));
  };

  const removeNameField = (index: number) => {
    setComandaNames((prev) => prev.filter((_, i) => i !== index));
  };

  const allNamesFilled = comandaNames.every((n) => n.trim().length > 0);

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
  const showOpenDialog =
    !hasOpenComandas && !blockedNoCashier && !opening && !!activeSession;

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
              Nova comanda
            </Button>
          </>
        )}
      </div>

      {/* Abertura de mesa livre — pede nome(s) da(s) comanda(s) */}
      <Dialog open={showOpenDialog}>
        <DialogContent className="max-w-[min(24rem,calc(100vw-2rem))] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Abrir Mesa {table.table_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Informe o nome de cada comanda. Você pode abrir várias comandas na mesma mesa.
            </p>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto px-1 -mx-1">
              {comandaNames.map((name, index) => (
                <div key={index} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Comanda {index + 1}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus={index === comandaNames.length - 1}
                      value={name}
                      onChange={(e) => updateName(index, e.target.value)}
                      placeholder="Ex: João, Casal..."
                      className="flex-1 min-w-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && allNamesFilled) {
                          e.preventDefault();
                          handleConfirmOpen();
                        }
                      }}
                    />
                    {comandaNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNameField(index)}
                        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-md border text-muted-foreground active:scale-95"
                        aria-label="Remover comanda"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNameField}
              disabled={comandaNames.length >= 10}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar comanda
            </Button>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleCancelOpen}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmOpen}
              disabled={opening || !allNamesFilled}
              className="flex-1"
            >
              Abrir mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
