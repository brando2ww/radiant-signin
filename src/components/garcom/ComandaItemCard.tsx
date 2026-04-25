import { cn } from "@/lib/utils";
import type { KitchenStatus } from "@/hooks/use-pdv-comandas";
import { formatBRL } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRightLeft, Trash2, Minus, Plus } from "lucide-react";

const kitchenStatusConfig: Record<KitchenStatus, { color: string; label: string }> = {
  pendente: { color: "bg-muted text-muted-foreground", label: "Pendente" },
  preparando: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", label: "Preparando" },
  pronto: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Pronto" },
  entregue: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Entregue" },
};

const sentToKitchenConfig = {
  color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  label: "Enviado",
};

interface ComandaItemCardProps {
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
  kitchenStatus: KitchenStatus;
  sentToKitchenAt?: string | null;
  onRemove?: () => void;
  onTransfer?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /**
   * "draft" = rascunho do garçom, ainda não enviado para cozinha. Mostra
   * controles de quantidade e botão remover sempre visível, sem badge de status.
   * "sent" = histórico em produção. Somente leitura, com badge.
   * Default "sent" para preservar compatibilidade.
   */
  variant?: "draft" | "sent";
}

export function ComandaItemCard({
  productName,
  quantity,
  unitPrice,
  notes,
  kitchenStatus,
  sentToKitchenAt,
  onRemove,
  onTransfer,
  onIncrement,
  onDecrement,
  selectMode = false,
  selected = false,
  onToggleSelect,
  variant = "sent",
}: ComandaItemCardProps) {
  const config =
    kitchenStatus === "pendente" && sentToKitchenAt
      ? sentToKitchenConfig
      : kitchenStatusConfig[kitchenStatus];
  const subtotal = quantity * unitPrice;
  const isDraft = variant === "draft";

  const handleCardClick = () => {
    if (selectMode) onToggleSelect?.();
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors",
        selectMode && "cursor-pointer active:scale-[0.99]",
        selectMode && selected && "border-primary bg-primary/5",
        !isDraft && !selectMode && "bg-muted/30",
      )}
      onClick={handleCardClick}
    >
      {selectMode && (
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect?.()}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
      )}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
        {quantity}x
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm leading-tight truncate">{productName}</p>
        {notes && (
          <p className="mt-0.5 text-xs text-muted-foreground italic truncate">{notes}</p>
        )}
        {/* Status badge: só em itens enviados (rascunho não precisa) */}
        {!isDraft && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.color)}>
              {config.label}
            </span>
          </div>
        )}
        {/* Controles de quantidade: só em rascunho, fora do selectMode */}
        {isDraft && !selectMode && (onIncrement || onDecrement) && (
          <div className="mt-2 inline-flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDecrement?.();
              }}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border bg-background text-foreground hover:bg-accent active:scale-95 transition-all"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIncrement?.();
              }}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border bg-background text-foreground hover:bg-accent active:scale-95 transition-all"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-semibold tabular-nums">{formatBRL(subtotal)}</span>
        {!selectMode && (onTransfer || onRemove) && (
          <div className="flex gap-1">
            {onTransfer && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTransfer();
                }}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all"
                aria-label="Mover item"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 active:scale-95 transition-all",
                  isDraft ? "h-9 w-9" : "h-7 w-7",
                )}
                aria-label="Remover item"
              >
                <Trash2 className={cn(isDraft ? "h-4 w-4" : "h-3.5 w-3.5")} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
