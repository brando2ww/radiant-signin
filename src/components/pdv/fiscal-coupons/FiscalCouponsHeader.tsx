import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import type { FiscalCoupon } from "@/hooks/use-fiscal-coupons";

export function FiscalCouponsHeader({ coupons }: { coupons: FiscalCoupon[] }) {
  const sum = (s: string) =>
    coupons.filter((c) => c.status === s).reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
  const cnt = (s: string) => coupons.filter((c) => c.status === s).length;
  const totalAuthValue = sum("autorizada");

  const items = [
    { label: "Autorizadas", count: cnt("autorizada"), value: formatBRL(totalAuthValue) },
    { label: "Pendentes", count: cnt("pendente"), value: formatBRL(sum("pendente")) },
    { label: "Rejeitadas", count: cnt("rejeitada"), value: formatBRL(sum("rejeitada")) },
    { label: "Canceladas", count: cnt("cancelada"), value: formatBRL(sum("cancelada")) },
    { label: "Total emitido", count: coupons.length, value: formatBRL(coupons.reduce((a, c) => a + Number(c.valor_total || 0), 0)) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="text-2xl font-semibold mt-1">{it.count}</div>
          <div className="text-xs text-muted-foreground mt-1">{it.value}</div>
        </Card>
      ))}
    </div>
  );
}
