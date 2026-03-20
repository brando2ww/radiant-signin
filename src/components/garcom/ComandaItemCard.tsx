import { cn } from "@/lib/utils";
import type { KitchenStatus } from "@/hooks/use-pdv-comandas";

const kitchenStatusConfig: Record<KitchenStatus, { color: string; label: string }> = {
  pendente: { color: "bg-muted text-muted-foreground", label: "Pendente" },
  preparando: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", label: "Preparando" },
  pronto: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Pronto" },
  entregue: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Entregue" },
};

interface ComandaItemCardProps {
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
  kitchenStatus: KitchenStatus;
  onRemove?: () => void;
}

export function ComandaItemCard({
  productName,
  quantity,
  unitPrice,
  notes,
  kitchenStatus,
}: ComandaItemCardProps) {
  const config = kitchenStatusConfig[kitchenStatus];
  const subtotal = quantity * unitPrice;

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
        {quantity}x
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm leading-tight truncate">{productName}</p>
        {notes && (
          <p className="mt-0.5 text-xs text-muted-foreground italic truncate">{notes}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.color)}>
            {config.label}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums">
        R$ {subtotal.toFixed(2)}
      </span>
    </div>
  );
}
