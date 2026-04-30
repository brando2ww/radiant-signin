import { Badge } from "@/components/ui/badge";

const map: Record<string, { label: string; className: string }> = {
  autorizada: { label: "Autorizada", className: "bg-primary/10 text-primary border-primary/30" },
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground border-border" },
  rejeitada: { label: "Rejeitada", className: "bg-destructive/10 text-destructive border-destructive/30" },
  cancelada: { label: "Cancelada", className: "bg-muted text-foreground border-border line-through decoration-1" },
};

export function FiscalCouponStatusBadge({ status }: { status: string }) {
  const cfg = map[status] || { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
