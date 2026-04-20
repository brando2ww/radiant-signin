import { useRef, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Printer, FileText, Loader2 } from "lucide-react";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import {
  UtensilsCrossed, Armchair, Calculator, Wine, Package, Briefcase,
} from "lucide-react";

const SECTOR_ICONS: Record<ChecklistSector, React.ElementType> = {
  cozinha: UtensilsCrossed,
  salao: Armchair,
  caixa: Calculator,
  bar: Wine,
  estoque: Package,
  gerencia: Briefcase,
};

interface ChecklistLite {
  id: string;
  name: string;
  sector: ChecklistSector;
  color?: string | null;
  qr_access_enabled?: boolean | null;
  is_active?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklists: ChecklistLite[];
}

export function BatchQrPosterDialog({ open, onOpenChange, checklists }: Props) {
  const [sector, setSector] = useState<ChecklistSector>("cozinha");
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      checklists.filter(
        (c) => c.sector === sector && c.is_active !== false && c.qr_access_enabled !== false
      ),
    [checklists, sector]
  );

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!sheetRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(sheetRef.current, { pixelRatio: 2, cacheBust: true });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, "PNG", 0, 0, pageW, pageH);
      pdf.save(`qrcodes-${sector}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:overflow-visible print:p-0 print:border-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Imprimir QR Codes do Setor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 print:hidden">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select value={sector} onValueChange={(v) => setSector(v as ChecklistSector)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {SECTOR_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                {filtered.length} checklist(s) ativo(s) com QR liberado.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint} size="sm" disabled={filtered.length === 0}>
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button onClick={handleDownloadPdf} size="sm" variant="outline" disabled={exporting || filtered.length === 0}>
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Baixar PDF
            </Button>
          </div>
        </div>

        <div className="flex justify-center bg-muted/30 rounded-lg p-4 print:bg-transparent print:p-0">
          <div
            ref={sheetRef}
            className="qr-batch-sheet bg-white p-8"
            style={{ width: 794, minHeight: 1123, transform: "scale(0.55)", transformOrigin: "top center" }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">QR Codes — {SECTOR_LABELS[sector]}</h1>
              <p className="text-sm text-muted-foreground">Escaneie cada QR para abrir o checklist correspondente</p>
            </div>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum checklist disponível neste setor.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((cl) => {
                  const Icon = SECTOR_ICONS[cl.sector];
                  const url = `${window.location.origin}/c/${cl.id}`;
                  const shortUrl = url.replace(/^https?:\/\//, "");
                  return (
                    <div
                      key={cl.id}
                      className="border-2 rounded-xl p-4 flex flex-col items-center gap-3 break-inside-avoid"
                      style={{ borderColor: cl.color || "#e5e7eb" }}
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-base leading-tight">{cl.name}</h3>
                        <div
                          className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs text-white font-medium"
                          style={{ backgroundColor: cl.color || "#6366f1" }}
                        >
                          <Icon className="h-3 w-3" />
                          {SECTOR_LABELS[cl.sector]}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border">
                        <QRCodeSVG value={url} size={160} level="H" includeMargin={false} />
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground text-center break-all">{shortUrl}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .qr-batch-sheet, .qr-batch-sheet * { visibility: visible; }
            .qr-batch-sheet {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              transform: none !important;
              width: 100vw !important;
              box-shadow: none !important;
            }
            .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
            @page { margin: 10mm; size: a4; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
