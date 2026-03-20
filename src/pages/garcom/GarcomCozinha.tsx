import { GarcomHeader } from "@/components/garcom/GarcomHeader";
import { usePDVKitchen } from "@/hooks/use-pdv-kitchen";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusOrder = ["pendente", "preparando", "pronto"] as const;

const statusConfig: Record<string, { bg: string; label: string }> = {
  pendente: { bg: "border-l-amber-500", label: "Pendente" },
  preparando: { bg: "border-l-orange-500", label: "Preparando" },
  pronto: { bg: "border-l-emerald-500", label: "Pronto" },
};

export default function GarcomCozinha() {
  const { items, isLoading } = usePDVKitchen();

  return (
    <div>
      <GarcomHeader title="Cozinha" />
      <div className="p-4 pb-24 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-muted-foreground">Nenhum pedido na cozinha</p>
          </div>
        ) : (
          statusOrder.map((status) => {
            const group = items.filter((i) => i.kitchen_status === status);
            if (group.length === 0) return null;
            const config = statusConfig[status];

            return (
              <div key={status}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {config.label} ({group.length})
                </h2>
                <div className="space-y-2">
                  {group.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border border-l-4 bg-card p-3",
                        config.bg
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">
                            {item.quantity}x {item.product_name}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          #{item.order?.order_number}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
