import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { EvidenceItem } from "@/hooks/use-checklist-evidence";

interface Props {
  evidence: EvidenceItem[];
  onView: (item: EvidenceItem) => void;
}

export function EvidenceAttentionSection({ evidence, onView }: Props) {
  const [open, setOpen] = useState(true);

  const attentionItems = evidence.filter(
    e => e.reviewStatus === "reprovado" || e.isCritical || e.isCompliant === false
  );

  if (attentionItems.length === 0) return null;

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="p-3">
        <button className="flex items-center gap-2 w-full text-left" onClick={() => setOpen(!open)}>
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-destructive">
            Evidências que precisam de atenção ({attentionItems.length})
          </span>
          {open ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </button>
        {open && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
            {attentionItems.slice(0, 12).map(item => (
              <div
                key={item.executionItemId}
                className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-destructive/40 hover:border-destructive transition-colors"
                onClick={() => onView(item)}
              >
                <img src={item.photoUrl} alt={item.itemTitle} className="aspect-square w-full object-cover" loading="lazy" />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1">
                  <p className="text-[9px] text-white truncate">{item.itemTitle}</p>
                  <div className="flex gap-1">
                    {item.isCritical && <Badge variant="destructive" className="text-[8px] px-1 py-0">Crítico</Badge>}
                    {item.isCompliant === false && <Badge variant="destructive" className="text-[8px] px-1 py-0">Não conforme</Badge>}
                    {item.reviewStatus === "reprovado" && <Badge variant="destructive" className="text-[8px] px-1 py-0">Reprovada</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
