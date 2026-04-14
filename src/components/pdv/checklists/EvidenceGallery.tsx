import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Check, X, Download, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useEvidenceGallery, useReviewEvidence, type EvidenceItem } from "@/hooks/use-checklist-evidence";
import { toast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const SECTORS = ["cozinha", "salao", "caixa", "bar", "estoque", "gerencia"];

export function EvidenceGallery() {
  const [dateFilter, setDateFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [comment, setComment] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data: evidence, isLoading } = useEvidenceGallery({
    date: dateFilter || undefined,
    sector: sectorFilter !== "all" ? sectorFilter : undefined,
  });

  const reviewMutation = useReviewEvidence();

  const handleReview = async (status: "aprovado" | "reprovado") => {
    if (!selectedEvidence) return;
    try {
      await reviewMutation.mutateAsync({
        executionItemId: selectedEvidence.executionItemId,
        status,
        comment: comment || undefined,
      });
      toast({ title: status === "aprovado" ? "Aprovado ✅" : "Reprovado ❌" });
      setSelectedEvidence(null);
      setComment("");
    } catch {
      toast({ title: "Erro ao avaliar", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    if (!evidence?.length) return;
    setExporting(true);
    try {
      const zip = new JSZip();
      for (const item of evidence) {
        try {
          const res = await fetch(item.photoUrl);
          const blob = await res.blob();
          const name = `${item.executionDate}_${item.operatorName}_${item.itemTitle}.jpg`.replace(/\s+/g, "_");
          zip.file(name, blob);
        } catch { /* skip failed */ }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `evidencias_${dateFilter || "todas"}.zip`);
    } catch {
      toast({ title: "Erro ao exportar", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
    aprovado: "default",
    reprovado: "destructive",
    pendente: "secondary",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Galeria de Evidências</h2>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Setor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || !evidence?.length}>
          <Download className="h-4 w-4 mr-1" />{exporting ? "Exportando..." : "Exportar ZIP"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !evidence?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />Nenhuma evidência encontrada.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {evidence.map((item) => (
            <Card key={item.executionItemId} className="cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={() => { setSelectedEvidence(item); setComment(""); }}>
              <div className="aspect-square relative">
                <img src={item.photoUrl} alt={item.itemTitle} className="w-full h-full object-cover" />
                {item.reviewStatus && (
                  <Badge variant={statusColors[item.reviewStatus] || "secondary"} className="absolute top-2 right-2 text-[10px]">
                    {item.reviewStatus}
                  </Badge>
                )}
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{item.itemTitle}</p>
                <p className="text-[10px] text-muted-foreground">{item.operatorName} • {item.executionDate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedEvidence} onOpenChange={(o) => !o && setSelectedEvidence(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedEvidence?.itemTitle}</DialogTitle></DialogHeader>
          {selectedEvidence && (
            <div className="space-y-3">
              <img src={selectedEvidence.photoUrl} alt="" className="w-full rounded-lg" />
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{selectedEvidence.sector}</Badge>
                <span>{selectedEvidence.operatorName}</span>
                <span>{selectedEvidence.executionDate}</span>
              </div>
              {selectedEvidence.reviewComment && (
                <p className="text-sm bg-muted p-2 rounded"><MessageSquare className="h-3 w-3 inline mr-1" />{selectedEvidence.reviewComment}</p>
              )}
              <Textarea placeholder="Comentário (opcional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleReview("aprovado")} disabled={reviewMutation.isPending}>
                  <Check className="h-4 w-4 mr-1" />Aprovar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReview("reprovado")} disabled={reviewMutation.isPending}>
                  <X className="h-4 w-4 mr-1" />Reprovar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
