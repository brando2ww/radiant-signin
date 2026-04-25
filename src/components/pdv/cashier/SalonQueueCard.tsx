import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import type { Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";

interface SalonQueueCardProps {
  comanda: Comanda;
  items: ComandaItem[];
  /** Rótulo principal (ex: "Mesa 5 — Eduardo" ou "Avulsa — TESTE") */
  title: string;
  /** Cor da borda esquerda do card (hash do order_id) */
  borderColor: string;
  /** Quantas outras comandas da mesma mesa ainda existem (abertas/em_cobranca) */
  siblingCount?: number;
  /** Minutos esperando (calculado pelo painel para todos os cards juntos) */
  waitingMinutes: number;
  onCharge: () => void;
  onReturnToWaiter: (reason: string) => void;
  isReturning?: boolean;
}

export function SalonQueueCard({
  comanda,
  items,
  title,
  borderColor,
  siblingCount = 0,
  waitingMinutes,
  onCharge,
  onReturnToWaiter,
  isReturning,
}: SalonQueueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const isCharging = comanda.status === "em_cobranca";
  const isOpen = comanda.status === "aberta";
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const preview =
    items.slice(0, 3).map((i) => `${i.quantity}x ${i.product_name}`).join(", ") +
    (items.length > 3 ? ", …" : "");

  // Urgência por tempo
  const urgency: "ok" | "warn" | "alert" =
    waitingMinutes >= 10 ? "alert" : waitingMinutes >= 5 ? "warn" : "ok";

  const waitingText =
    waitingMinutes < 1
      ? "Aguardando há menos de 1 min"
      : `Aguardando há ${waitingMinutes} min${urgency === "alert" ? " — atenção" : ""}`;

  const handleConfirmReturn = () => {
    const reason = returnReason.trim();
    if (!reason) return;
    onReturnToWaiter(reason);
    setReturnDialog(false);
    setReturnReason("");
  };

  return (
    <>
      <div
        className={cn(
          "rounded-lg border bg-card border-l-4 p-3 transition-colors",
          borderColor,
          urgency === "alert" && "border-destructive ring-1 ring-destructive/30",
          isCharging && "opacity-80",
        )}
        aria-busy={isCharging}
      >
        {/* Linha 1: identificação + status */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-semibold text-sm leading-tight truncate">{title}</div>
          {isCharging ? (
            <Badge className="bg-blue-500 text-white hover:bg-blue-500 gap-1 text-[10px] shrink-0">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Em cobrança
            </Badge>
          ) : isOpen ? (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 text-[10px] shrink-0">
              Aberta
            </Badge>
          ) : (
            <Badge className="bg-orange-500 text-white hover:bg-orange-500 text-[10px] shrink-0">
              Aguardando
            </Badge>
          )}
        </div>

        {/* Linha 2: itens + valor (destaque) */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="text-xs text-muted-foreground">
            {totalQty} {totalQty === 1 ? "item" : "itens"}
          </span>
          <span className="text-xl font-bold text-foreground tabular-nums">
            {formatBRL(comanda.subtotal)}
          </span>
        </div>

        {/* Linha 3: tempo aguardando com cor progressiva */}
        <div
          className={cn(
            "flex items-center gap-1 text-xs mb-1",
            urgency === "ok" && "text-muted-foreground",
            urgency === "warn" && "text-yellow-600 dark:text-yellow-500",
            urgency === "alert" && "text-destructive font-semibold",
          )}
        >
          {urgency === "alert" ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {waitingText}
        </div>

        {/* Linha 4: prévia de itens */}
        {items.length > 0 && (
          <div className="text-[11px] text-muted-foreground line-clamp-1 mb-2">
            {preview}
          </div>
        )}

        {/* Indicador de mesa com mais comandas */}
        {siblingCount > 0 && (
          <div className="text-[11px] text-muted-foreground mb-2 italic">
            Mesa tem mais {siblingCount} comanda{siblingCount > 1 ? "s" : ""}
          </div>
        )}

        {/* Itens expandidos inline */}
        {expanded && (
          <div className="mt-2 mb-2 rounded-md bg-muted/40 p-2 space-y-1 max-h-48 overflow-auto">
            {items.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sem itens</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="truncate pr-2">
                    <span className="font-medium">{item.quantity}x</span>{" "}
                    {item.product_name}
                    {item.notes && (
                      <span className="text-muted-foreground"> · {item.notes}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {formatBRL(item.subtotal)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-1.5 mt-2">
          <Button
            size="sm"
            className="flex-1 h-10 gap-1.5 font-semibold"
            onClick={onCharge}
          >
            <CreditCard className="h-4 w-4" />
            Cobrar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-10 px-2"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Recolher" : "Ver itens"}
            aria-label={expanded ? "Recolher itens" : "Ver itens"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {!isOpen && (
            <Button
              size="sm"
              variant="ghost"
              className="h-10 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setReturnDialog(true)}
              title="Devolver ao garçom"
              aria-label="Devolver ao garçom"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog
        open={returnDialog}
        onOpenChange={(o) => {
          if (!o) {
            setReturnDialog(false);
            setReturnReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Devolver ao garçom — {title}</AlertDialogTitle>
            <AlertDialogDescription>
              A comanda voltará ao status "aberta" e o garçom poderá adicionar mais
              itens. Informe o motivo (obrigatório):
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Ex: cliente pediu mais itens, comanda incompleta..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            autoFocus
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmReturn();
              }}
              disabled={!returnReason.trim() || isReturning}
            >
              {isReturning ? "Devolvendo..." : "Devolver ao garçom"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
