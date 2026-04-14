import { AlertTriangle, PackageX, Clock, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExpiryItem } from "@/hooks/use-product-expiry";

interface Props {
  items: ExpiryItem[];
  onDiscard: (id: string) => void;
  onUseToday: (id: string) => void;
}

export function ExpiryAlertBlock({ items, onDiscard, onUseToday }: Props) {
  const expired = items.filter((i) => i.daysLeft < 0);
  const critical = items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 1);
  const warning = items.filter((i) => i.daysLeft >= 2 && i.daysLeft <= 3);

  if (!expired.length && !critical.length && !warning.length) return null;

  const groups = [
    { items: expired, label: "Vencidos", bg: "bg-destructive/10 border-destructive/30", icon: "text-destructive", badgeVariant: "destructive" as const },
    { items: critical, label: "Vence em 1 dia", bg: "bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700", icon: "text-orange-500", badgeVariant: "secondary" as const },
    { items: warning, label: "Vence em até 3 dias", bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700", icon: "text-yellow-500", badgeVariant: "outline" as const },
  ];

  return (
    <div className="space-y-3">
      {groups.map((g) =>
        g.items.length > 0 ? (
          <div key={g.label} className={`rounded-lg border p-3 ${g.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-4 w-4 ${g.icon}`} />
              <span className="text-sm font-semibold">{g.label}</span>
              <Badge variant={g.badgeVariant} className="text-[10px]">{g.items.length}</Badge>
            </div>
            <div className="space-y-2">
              {g.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-background/60 rounded-md px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.batch_id && `Lote: ${item.batch_id} · `}
                      Vence: {item.expiry_date}
                      {item.storage_location && ` · ${item.storage_location}`}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUseToday(item.id)}>
                      <Clock className="h-3 w-3 mr-1" />Usar hoje
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onDiscard(item.id)}>
                      <PackageX className="h-3 w-3 mr-1" />Descartar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
