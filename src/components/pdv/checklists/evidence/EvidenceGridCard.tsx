import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import type { EvidenceItem } from "@/hooks/use-checklist-evidence";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  aprovado: { label: "Aprovada", variant: "default" },
  reprovado: { label: "Reprovada", variant: "destructive" },
  pendente: { label: "Pendente", variant: "secondary" },
};

interface Props {
  item: EvidenceItem;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function EvidenceGridCard({ item, onView, onApprove, onReject }: Props) {
  const status = item.reviewStatus || "pendente";
  const cfg = statusConfig[status] || statusConfig.pendente;
  const needsAttention = item.isCritical || item.isCompliant === false;

  return (
    <Card
      className={`cursor-pointer overflow-hidden group transition-all hover:ring-2 hover:ring-primary ${needsAttention ? "ring-2 ring-destructive/50" : ""}`}
      onClick={onView}
    >
      <div className="aspect-square relative overflow-hidden">
        <img src={item.photoUrl} alt={item.itemTitle} className="w-full h-full object-cover" loading="lazy" />
        <Badge variant={cfg.variant} className="absolute top-2 right-2 text-[10px]">
          {cfg.label}
        </Badge>
        {item.isCritical && (
          <Badge variant="destructive" className="absolute top-2 left-2 text-[10px]">Crítico</Badge>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={e => { e.stopPropagation(); onView(); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="default" className="h-8 w-8" onClick={e => { e.stopPropagation(); onApprove(); }}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={e => { e.stopPropagation(); onReject(); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-2 space-y-0.5">
        <p className="text-xs font-medium truncate">{item.itemTitle}</p>
        <p className="text-[10px] text-muted-foreground truncate">{item.operatorName} • {item.checklistName}</p>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[9px] px-1 py-0">{item.sector}</Badge>
          <span className="text-[10px] text-muted-foreground">{item.executionDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
