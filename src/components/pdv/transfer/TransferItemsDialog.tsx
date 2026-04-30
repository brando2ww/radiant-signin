import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Search, Utensils, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { usePDVComandas, type Comanda, type ComandaItem } from "@/hooks/use-pdv-comandas";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { formatTableLabel } from "@/utils/formatTableNumber";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TransferItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ComandaItem[];
  sourceComanda: Comanda | null;
  onTransferred?: () => void;
}

type Step = "destination" | "confirm";

export function TransferItemsDialog({
  open,
  onOpenChange,
  items,
  sourceComanda,
  onTransferred,
}: TransferItemsDialogProps) {
  const { comandas, transferItems, isTransferringItems } = usePDVComandas();
  const { tables } = usePDVTables();

  const [step, setStep] = useState<Step>("destination");
  const [search, setSearch] = useState("");
  const [targetComandaId, setTargetComandaId] = useState<string | null>(null);
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);

  const totalAmount = items.reduce((s, it) => s + Number(it.subtotal || 0), 0);
  const hasPreparedItems = items.some(
    (it) => it.kitchen_status === "pronto" || it.kitchen_status === "entregue",
  );

  // Reset state ao fechar
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep("destination");
      setSearch("");
      setTargetComandaId(null);
      setExpandedTableId(null);
    }
    onOpenChange(next);
  };

  // Comandas abertas (potenciais destinos)
  const openComandas = useMemo(
    () => comandas.filter((c) => c.status === "aberta" && c.id !== sourceComanda?.id),
    [comandas, sourceComanda?.id],
  );

  // Mesas com comandas abertas (excluindo a mesa de origem)
  const sourceOrderId = sourceComanda?.order_id ?? null;
  const tablesWithComandas = useMemo(() => {
    return tables
      .filter((t) => t.current_order_id && t.current_order_id !== sourceOrderId)
      .map((t) => {
        const tComandas = openComandas.filter((c) => c.order_id === t.current_order_id);
        return { table: t, comandas: tComandas };
      })
      .filter((entry) => entry.comandas.length > 0);
  }, [tables, openComandas, sourceOrderId]);

  // Comandas avulsas (sem mesa)
  const standaloneComandas = useMemo(
    () => openComandas.filter((c) => !c.order_id),
    [openComandas],
  );

  const filteredTables = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tablesWithComandas;
    return tablesWithComandas.filter(({ table, comandas: cs }) => {
      const tableMatch = formatTableLabel(table.table_number).toLowerCase().includes(q);
      const comandaMatch = cs.some(
        (c) =>
          (c.customer_name || "").toLowerCase().includes(q) ||
          (c.comanda_number || "").toLowerCase().includes(q),
      );
      return tableMatch || comandaMatch;
    });
  }, [tablesWithComandas, search]);

  const filteredStandalone = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return standaloneComandas;
    return standaloneComandas.filter(
      (c) =>
        (c.customer_name || "").toLowerCase().includes(q) ||
        (c.comanda_number || "").toLowerCase().includes(q),
    );
  }, [standaloneComandas, search]);

  const targetComanda = useMemo(
    () => comandas.find((c) => c.id === targetComandaId) || null,
    [comandas, targetComandaId],
  );

  const targetTable = useMemo(() => {
    if (!targetComanda?.order_id) return null;
    return tables.find((t) => t.current_order_id === targetComanda.order_id) || null;
  }, [tables, targetComanda]);

  const sourceTable = useMemo(() => {
    if (!sourceComanda?.order_id) return null;
    return tables.find((t) => t.current_order_id === sourceComanda.order_id) || null;
  }, [tables, sourceComanda]);

  const handleSelectComanda = (comandaId: string) => {
    setTargetComandaId(comandaId);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!sourceComanda || !targetComandaId) return;
    try {
      await transferItems({
        itemIds: items.map((i) => i.id),
        targetKind: "comanda",
        targetId: targetComandaId,
      });
      const fromLabel = sourceTable
        ? formatTableLabel(sourceTable.table_number)
        : sourceComanda.customer_name || sourceComanda.comanda_number;
      const toLabel = targetTable
        ? formatTableLabel(targetTable.table_number)
        : targetComanda?.customer_name || targetComanda?.comanda_number || "destino";
      toast.success(
        items.length === 1
          ? `Item movido de ${fromLabel} para ${toLabel}`
          : `${items.length} itens movidos de ${fromLabel} para ${toLabel}`,
      );
      onTransferred?.();
      handleOpenChange(false);
    } catch {
      // toast já tratado no hook
    }
  };

  if (!sourceComanda) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {step === "destination" ? "Mover item para outra comanda" : "Confirmar transferência"}
          </DialogTitle>
          <DialogDescription>
            {step === "destination"
              ? `Selecione a comanda de destino para ${items.length === 1 ? "o item" : `os ${items.length} itens`}.`
              : "Revise os detalhes antes de confirmar."}
          </DialogDescription>
        </DialogHeader>

        {/* Itens em destaque */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{items.length === 1 ? "Item selecionado" : `${items.length} itens selecionados`}</span>
            <span className="font-semibold tabular-nums text-foreground">{formatBRL(totalAmount)}</span>
          </div>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{it.quantity}×</span>
                  <span className="flex-1 truncate">{it.product_name}</span>
                  <span className="tabular-nums text-muted-foreground">{formatBRL(it.subtotal)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {hasPreparedItems && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 flex gap-2 text-xs text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Algum item já foi preparado pela cozinha. Mover não desfaz o preparo —
              apenas reatribui o item à comanda destino.
            </span>
          </div>
        )}

        {step === "destination" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mesa ou comanda…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {filteredTables.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Mesas ocupadas
                    </p>
                    {filteredTables.map(({ table, comandas: tComandas }) => {
                      const isExpanded = expandedTableId === table.id;
                      const singleComanda = tComandas.length === 1;
                      const handleClick = () => {
                        if (singleComanda) {
                          handleSelectComanda(tComandas[0].id);
                        } else {
                          setExpandedTableId(isExpanded ? null : table.id);
                        }
                      };
                      return (
                        <div
                          key={table.id}
                          className="rounded-lg border bg-card overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={handleClick}
                            className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 active:scale-[0.99] transition-all text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Utensils className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">
                                {formatTableLabel(table.table_number)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {tComandas.length} comanda{tComandas.length > 1 ? "s" : ""} —{" "}
                                {tComandas
                                  .map((c) => c.customer_name || c.comanda_number)
                                  .join(", ")}
                              </p>
                            </div>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                isExpanded && !singleComanda && "rotate-90",
                              )}
                            />
                          </button>
                          {isExpanded && !singleComanda && (
                            <div className="border-t bg-muted/30 p-2 space-y-1">
                              {tComandas.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleSelectComanda(c.id)}
                                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent active:scale-[0.99] transition-all text-left text-sm"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {c.customer_name || c.comanda_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatBRL(c.subtotal)}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredStandalone.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Comandas avulsas
                    </p>
                    {filteredStandalone.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectComanda(c.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 active:scale-[0.99] transition-all text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {c.customer_name || c.comanda_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.comanda_number} · {formatBRL(c.subtotal)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          Avulsa
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredTables.length === 0 && filteredStandalone.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma comanda disponível para receber os itens.
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && targetComanda && (
          <>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 bg-destructive/5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    De
                  </p>
                  <p className="font-semibold text-sm">
                    {sourceTable
                      ? formatTableLabel(sourceTable.table_number)
                      : "Avulsa"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {sourceComanda.customer_name || sourceComanda.comanda_number}
                  </p>
                  <p className="mt-2 text-xs text-destructive font-medium tabular-nums">
                    − {formatBRL(totalAmount)}
                  </p>
                </div>
                <div className="rounded-lg border p-3 bg-emerald-500/5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Para
                  </p>
                  <p className="font-semibold text-sm">
                    {targetTable
                      ? formatTableLabel(targetTable.table_number)
                      : "Avulsa"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {targetComanda.customer_name || targetComanda.comanda_number}
                  </p>
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                    + {formatBRL(totalAmount)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                Esta ação é registrada no log de auditoria e atualiza os subtotais imediatamente.
                A comanda de origem permanecerá aberta mesmo se ficar vazia.
              </div>
            </div>

            <Separator />
            <div className="flex justify-between gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep("destination")}
                disabled={isTransferringItems}
              >
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isTransferringItems}
                >
                  Cancelar
                </Button>
                <Button onClick={handleConfirm} disabled={isTransferringItems}>
                  {isTransferringItems ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transferindo…
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Confirmar transferência
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
