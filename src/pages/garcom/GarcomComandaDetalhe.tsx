import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Send, CreditCard, Utensils, Clock, ArrowRightLeft, CheckSquare, X, Pencil, ChefHat } from "lucide-react";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { ComandaItemCard } from "@/components/garcom/ComandaItemCard";
import { TransferItemsDialog } from "@/components/pdv/transfer/TransferItemsDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTableLabel } from "@/utils/formatTableNumber";
import { formatBRL } from "@/lib/format";

export default function GarcomComandaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    comandas,
    comandaItems,
    isLoading,
    sendToKitchenAsync,
    closeComanda,
    removeItem,
    updateItem,
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

  const isDraftItem = (i: typeof items[number]) =>
    i.kitchen_status === "pendente" && !i.sent_to_kitchen_at;
  const draftItems = items.filter(isDraftItem);
  const sentItems = items.filter((i) => !isDraftItem(i));
  const pendingIds = draftItems.map((i) => i.id);

  const handleIncrement = (item: typeof items[number]) =>
    updateItem({ id: item.id, quantity: item.quantity + 1 });
  const handleDecrement = (item: typeof items[number]) => {
    if (item.quantity <= 1) removeItem(item.id);
    else updateItem({ id: item.id, quantity: item.quantity - 1 });
  };

  const isLocked =
    comanda?.status === "aguardando_pagamento" ||
    comanda?.status === "em_cobranca";
  const isClosed = comanda?.status === "fechada" || comanda?.status === "cancelada";
  const canEdit = comanda?.status === "aberta";

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [transferIds, setTransferIds] = useState<string[] | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleTransferSelected = () => {
    if (selectedIds.size === 0) return;
    setTransferIds(Array.from(selectedIds));
  };

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

  const statusBadge = (() => {
    if (comanda.status === "aguardando_pagamento") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
          <Clock className="h-3 w-3" />
          Aguardando caixa
        </span>
      );
    }
    if (comanda.status === "em_cobranca") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
          <CreditCard className="h-3 w-3" />
          Sendo cobrada no caixa
        </span>
      );
    }
    if (comanda.status === "fechada") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          Paga
        </span>
      );
    }
    return null;
  })();

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
          <div className="flex items-center gap-2 flex-wrap">
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
            {statusBadge}
          </div>
        </div>
        {canEdit && items.length > 0 && (
          <button
            type="button"
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className="ml-auto h-9 px-3 rounded-md text-xs font-medium hover:bg-accent active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            {selectMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            {selectMode ? "Cancelar" : "Selecionar"}
          </button>
        )}
      </header>

      {/* Items */}
      <div className="flex-1 p-4 pb-56 space-y-2">
        {isLocked && (
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-3 text-xs text-orange-700 dark:text-orange-300">
            Esta comanda já foi enviada para o caixa. Não é possível adicionar ou remover itens.
          </div>
        )}
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-muted-foreground mb-4">Sem itens na comanda</p>
            {canEdit && (
              <Button
                onClick={() => navigate(`/garcom/comanda/${id}/adicionar`)}
                size="lg"
                className="active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            )}
          </div>
        ) : selectMode ? (
          // Em modo seleção, lista plana para permitir transferência atravessando grupos
          items.map((item) => (
            <ComandaItemCard
              key={item.id}
              productName={item.product_name}
              quantity={item.quantity}
              unitPrice={item.unit_price}
              notes={item.notes}
              kitchenStatus={item.kitchen_status}
              sentToKitchenAt={item.sent_to_kitchen_at}
              selectMode
              selected={selectedIds.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
            />
          ))
        ) : (
          <>
            {/* Grupo: Novos itens — não enviados ainda */}
            {draftItems.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 px-1 pt-1">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Novos itens — não enviados ainda
                    <span className="ml-1 normal-case text-muted-foreground/70">
                      ({draftItems.length})
                    </span>
                  </h2>
                </div>
                {draftItems.map((item) => (
                  <ComandaItemCard
                    key={item.id}
                    variant="draft"
                    productName={item.product_name}
                    quantity={item.quantity}
                    unitPrice={item.unit_price}
                    notes={item.notes}
                    kitchenStatus={item.kitchen_status}
                    sentToKitchenAt={item.sent_to_kitchen_at}
                    onRemove={canEdit ? () => removeItem(item.id) : undefined}
                    onIncrement={canEdit ? () => handleIncrement(item) : undefined}
                    onDecrement={canEdit ? () => handleDecrement(item) : undefined}
                    onTransfer={canEdit ? () => setTransferIds([item.id]) : undefined}
                  />
                ))}
              </section>
            )}

            {/* Grupo: Já enviados para a cozinha */}
            {sentItems.length > 0 && (
              <section className="space-y-2 pt-2">
                <div className="flex items-center gap-2 px-1 pt-1">
                  <ChefHat className="h-3.5 w-3.5 text-muted-foreground" />
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Já enviados para a cozinha
                    <span className="ml-1 normal-case text-muted-foreground/70">
                      ({sentItems.length})
                    </span>
                  </h2>
                </div>
                {sentItems.map((item) => (
                  <ComandaItemCard
                    key={item.id}
                    variant="sent"
                    productName={item.product_name}
                    quantity={item.quantity}
                    unitPrice={item.unit_price}
                    notes={item.notes}
                    kitchenStatus={item.kitchen_status}
                    sentToKitchenAt={item.sent_to_kitchen_at}
                    /* Itens enviados: somente leitura — sem remover/mover fora do selectMode */
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* Bottom Action Bar */}
      {!isClosed && !selectMode && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-background">
          <div className="p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatBRL(total)}</span>
            </div>
            {canEdit ? (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="active:scale-95 h-11"
                  onClick={() => navigate(`/garcom/comanda/${id}/adicionar`)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Item
                </Button>
                {pendingIds.length > 0 ? (
                  <Button
                    className="active:scale-95 h-11"
                    onClick={async () => {
                      await sendToKitchenAsync(pendingIds);
                      navigate("/garcom");
                    }}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Cozinha
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  variant="secondary"
                  className="active:scale-95 h-11"
                  disabled={items.length === 0}
                  onClick={() => {
                    closeComanda(comanda.id);
                    navigate(-1);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Fechar
                </Button>
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-2">
                {comanda.status === "em_cobranca"
                  ? "O caixa está cobrando esta comanda."
                  : "Aguardando o operador do caixa cobrar esta comanda."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Selection Action Bar */}
      {selectMode && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-background">
          <div className="p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] flex items-center gap-2">
            <span className="text-sm font-medium flex-1">
              {selectedIds.size} {selectedIds.size === 1 ? "selecionado" : "selecionados"}
            </span>
            <Button variant="outline" className="h-11" onClick={exitSelectMode}>
              Cancelar
            </Button>
            <Button
              className="h-11 active:scale-95"
              onClick={handleTransferSelected}
              disabled={selectedIds.size === 0}
            >
              <ArrowRightLeft className="h-4 w-4 mr-1.5" />
              Mover ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}

      {/* Transfer Items Dialog */}
      <TransferItemsDialog
        open={!!transferIds}
        onOpenChange={(o) => !o && setTransferIds(null)}
        sourceComanda={comanda ?? null}
        items={transferIds ? items.filter((it) => transferIds.includes(it.id)) : []}
        onTransferred={() => {
          setTransferIds(null);
          exitSelectMode();
        }}
      />
    </div>
  );
}
