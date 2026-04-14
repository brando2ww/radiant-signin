import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X } from "lucide-react";
import type { EvidenceItem } from "@/hooks/use-checklist-evidence";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  aprovado: { label: "Aprovada", variant: "default" },
  reprovado: { label: "Reprovada", variant: "destructive" },
  pendente: { label: "Pendente", variant: "secondary" },
};

interface Props {
  evidence: EvidenceItem[];
  onView: (index: number) => void;
  onBatchReview: (ids: string[], status: "aprovado" | "reprovado") => void;
  reviewing: boolean;
}

export function EvidenceListView({ evidence, onView, onBatchReview, reviewing }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selected.size === evidence.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(evidence.map(e => e.executionItemId)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-2">
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selected.size} selecionados</span>
          <Button size="sm" variant="default" onClick={() => { onBatchReview(Array.from(selected), "aprovado"); setSelected(new Set()); }} disabled={reviewing}>
            <Check className="h-3 w-3 mr-1" />Aprovar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => { onBatchReview(Array.from(selected), "reprovado"); setSelected(new Set()); }} disabled={reviewing}>
            <X className="h-3 w-3 mr-1" />Reprovar
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={selected.size === evidence.length && evidence.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="w-14">Foto</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evidence.map((item, idx) => {
              const status = item.reviewStatus || "pendente";
              const cfg = statusConfig[status] || statusConfig.pendente;
              return (
                <TableRow key={item.executionItemId} className={`cursor-pointer ${item.isCritical || item.isCompliant === false ? "bg-destructive/5" : ""}`} onClick={() => onView(idx)}>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.has(item.executionItemId)} onCheckedChange={() => toggle(item.executionItemId)} />
                  </TableCell>
                  <TableCell>
                    <img src={item.photoUrl} alt="" className="w-10 h-10 rounded object-cover" loading="lazy" />
                  </TableCell>
                  <TableCell className="text-xs">{item.operatorName}</TableCell>
                  <TableCell className="text-xs">{item.checklistName}</TableCell>
                  <TableCell className="text-xs font-medium">{item.itemTitle}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{item.sector}</Badge></TableCell>
                  <TableCell className="text-xs">{item.executionDate}</TableCell>
                  <TableCell><Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge></TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onBatchReview([item.executionItemId], "aprovado")} disabled={reviewing}>
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onBatchReview([item.executionItemId], "reprovado")} disabled={reviewing}>
                        <X className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
