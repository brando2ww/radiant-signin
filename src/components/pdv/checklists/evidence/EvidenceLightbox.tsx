import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, ChevronLeft, ChevronRight, MessageSquare, User } from "lucide-react";
import type { EvidenceItem } from "@/hooks/use-checklist-evidence";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  aprovado: { label: "Aprovada", variant: "default" },
  reprovado: { label: "Reprovada", variant: "destructive" },
  pendente: { label: "Pendente", variant: "secondary" },
};

interface Props {
  evidence: EvidenceItem[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onReview: (id: string, status: "aprovado" | "reprovado", comment?: string) => void;
  reviewing: boolean;
}

export function EvidenceLightbox({ evidence, currentIndex, open, onClose, onNavigate, onReview, reviewing }: Props) {
  const [comment, setComment] = useState("");
  const item = evidence[currentIndex];

  useEffect(() => {
    if (item) setComment("");
  }, [currentIndex]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < evidence.length - 1) onNavigate(currentIndex + 1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, currentIndex, evidence.length]);

  if (!item) return null;
  const status = item.reviewStatus || "pendente";
  const cfg = statusConfig[status] || statusConfig.pendente;

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex overflow-hidden">
        {/* Left: Photo */}
        <div className="flex-1 bg-black relative flex items-center justify-center min-w-0">
          <img src={item.photoUrl} alt={item.itemTitle} className="max-w-full max-h-full object-contain" />
          {currentIndex > 0 && (
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10" onClick={() => onNavigate(currentIndex - 1)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {currentIndex < evidence.length - 1 && (
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10" onClick={() => onNavigate(currentIndex + 1)}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {evidence.length}
          </div>
        </div>

        {/* Right: Info panel */}
        <div className="w-80 border-l flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4 flex-1">
            <h3 className="font-semibold text-sm">{item.itemTitle}</h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.operatorName}</p>
                  <p className="text-muted-foreground">{item.sector}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-medium">Checklist</p>
                  <p className="text-foreground text-xs">{item.checklistName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-medium">Data</p>
                  <p className="text-foreground text-xs">{item.executionDate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-medium">Tipo</p>
                  <p className="text-foreground text-xs">{item.itemType}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-medium">Status</p>
                  <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                </div>
              </div>

              {item.isCritical && <Badge variant="destructive" className="text-[10px]">Item Crítico</Badge>}
              {item.isCompliant === false && <Badge variant="destructive" className="text-[10px]">Não conforme</Badge>}
            </div>

            {item.reviewComment && (
              <div className="bg-muted p-2 rounded text-xs">
                <MessageSquare className="h-3 w-3 inline mr-1" />
                {item.reviewComment}
                {item.reviewedAt && <p className="text-[10px] text-muted-foreground mt-1">em {new Date(item.reviewedAt).toLocaleString("pt-BR")}</p>}
              </div>
            )}

            <Textarea
              placeholder="Comentário (opcional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="p-4 border-t flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => onReview(item.executionItemId, "aprovado", comment)} disabled={reviewing}>
              <Check className="h-4 w-4 mr-1" />Aprovar
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => onReview(item.executionItemId, "reprovado", comment)} disabled={reviewing}>
              <X className="h-4 w-4 mr-1" />Reprovar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
