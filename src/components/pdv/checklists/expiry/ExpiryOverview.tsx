import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle, TrendingDown } from "lucide-react";
import type { ExpiryItem } from "@/hooks/use-product-expiry";

interface Props {
  items: ExpiryItem[];
  lossCount: number;
  lossValue: number;
}

export function ExpiryOverview({ items, lossCount, lossValue }: Props) {
  const total = items.length;
  const alert = items.filter((i) => i.daysLeft <= 3 && i.daysLeft >= 0).length;
  const expired = items.filter((i) => i.daysLeft < 0).length;

  const cards = [
    { label: "Produtos ativos", value: total, icon: Package, color: "text-primary" },
    { label: "Em alerta (≤3 dias)", value: alert, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Vencidos", value: expired, icon: XCircle, color: "text-destructive" },
    { label: "Perdas do mês", value: `${lossCount} itens · R$ ${lossValue.toFixed(2)}`, icon: TrendingDown, color: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <c.icon className={`h-5 w-5 shrink-0 ${c.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
