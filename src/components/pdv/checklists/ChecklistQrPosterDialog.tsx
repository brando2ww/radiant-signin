import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Printer, Download, FileText, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import {
  UtensilsCrossed, Armchair, Calculator, Wine, Package, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTOR_ICONS: Record<ChecklistSector, React.ElementType> = {
  cozinha: UtensilsCrossed,
  salao: Armchair,
  caixa: Calculator,
  bar: Wine,
  estoque: Package,
  gerencia: Briefcase,
};

type Size = "a4" | "a5" | "label";

const SIZE_DIMENSIONS: Record<Size, { w: number; h: number; label: string; pdf: [number, number]; pdfFormat: any }> = {
  a4: { w: 794, h: 1123, label: "A4 (210×297mm)", pdf: [210, 297], pdfFormat: "a4" },
  a5: { w: 559, h: 794, label: "A5 (148×210mm)", pdf: [148, 210], pdfFormat: "a5" },
  label: { w: 378, h: 378, label: "Etiqueta 10×10cm", pdf: [100, 100], pdfFormat: [100, 100] },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: {
    id: string;
    name: string;
    sector: ChecklistSector;
    color?: string | null;
  } | null;
  businessName?: string;
}

export function ChecklistQrPosterDialog({ open, onOpenChange, checklist, businessName }: Props) {
  const [size, setSize] = useState<Size>("a4");
  const [coloredBg, setColoredBg] = useState(false);
  const [exporting, setExporting] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  if (!checklist) return null;

  const url = `${window.location.origin}/c/${checklist.id}`;
  const shortUrl = url.replace(/^https?:\/\//, "");
  const color = checklist.color || "#6366f1";
  const SectorIcon = SECTOR_ICONS[checklist.sector];
  const dim = SIZE_DIMENSIONS[size];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qrcode-${checklist.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2, cacheBust: true });
      const pdf = new jsPDF({
        orientation: dim.pdf[0] > dim.pdf[1] ? "landscape" : "portrait",
        unit: "mm",
        format: dim.pdfFormat,
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, "PNG", 0, 0, pageW, pageH);
      pdf.save(`qrcode-${checklist.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:p-0 print:border-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>QR Code do Checklist</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="space-y-4 print:hidden">
          <div className="space-y-2">
            <Label>Tamanho do cartaz</Label>
            <Tabs value={size} onValueChange={(v) => setSize(v as Size)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="a4">A4</TabsTrigger>
                <TabsTrigger value="a5">A5</TabsTrigger>
                <TabsTrigger value="label">Etiqueta 10×10</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Fundo colorido</Label>
              <p className="text-xs text-muted-foreground">Usa a cor do checklist como fundo</p>
            </div>
            <Switch checked={coloredBg} onCheckedChange={setColoredBg} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button onClick={handleDownloadPng} size="sm" variant="outline" disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Baixar PNG
            </Button>
            <Button onClick={handleDownloadPdf} size="sm" variant="outline" disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Baixar PDF
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center bg-muted/30 rounded-lg p-4 print:bg-transparent print:p-0">
          <div
            ref={posterRef}
            className={cn(
              "qr-poster relative shadow-lg print:shadow-none flex flex-col items-center justify-between",
              coloredBg ? "text-white" : "text-foreground bg-white",
            )}
            style={{
              width: dim.w,
              height: dim.h,
              backgroundColor: coloredBg ? color : "#ffffff",
              padding: size === "label" ? "16px" : "48px",
              transform: size === "a4" ? "scale(0.55)" : size === "a5" ? "scale(0.7)" : "scale(0.95)",
              transformOrigin: "top center",
            }}
          >
            {/* Top: Logo */}
            <div className={cn("flex items-center justify-center", coloredBg && "bg-white/95 rounded-lg px-4 py-2")}>
              <Logo size={size === "label" ? "sm" : "lg"} />
            </div>

            {/* Middle: Name + Sector + QR */}
            <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
              <div className="text-center space-y-2">
                <h2
                  className="font-bold leading-tight"
                  style={{ fontSize: size === "label" ? 22 : size === "a5" ? 36 : 48 }}
                >
                  {checklist.name}
                </h2>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold",
                    coloredBg ? "bg-white/20 backdrop-blur" : "text-white"
                  )}
                  style={{
                    backgroundColor: coloredBg ? undefined : color,
                    fontSize: size === "label" ? 12 : 16,
                  }}
                >
                  <SectorIcon className="h-4 w-4" />
                  {SECTOR_LABELS[checklist.sector]}
                </div>
              </div>

              <div
                className="bg-white p-4 rounded-2xl"
                style={{ boxShadow: coloredBg ? "0 8px 24px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.08)" }}
              >
                <QRCodeSVG
                  value={url}
                  size={size === "label" ? 220 : size === "a5" ? 320 : 420}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p
                className={cn("font-semibold text-center", coloredBg ? "text-white" : "text-foreground")}
                style={{ fontSize: size === "label" ? 14 : 22 }}
              >
                Escaneie para abrir o checklist
              </p>
            </div>

            {/* Bottom: footer */}
            <div className="text-center w-full space-y-1 pt-4">
              {businessName && (
                <p
                  className={cn("font-medium", coloredBg ? "text-white/90" : "text-muted-foreground")}
                  style={{ fontSize: size === "label" ? 11 : 14 }}
                >
                  {businessName}
                </p>
              )}
              <p
                className={cn("font-mono", coloredBg ? "text-white/80" : "text-muted-foreground")}
                style={{ fontSize: size === "label" ? 9 : 12 }}
              >
                {shortUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .qr-poster, .qr-poster * { visibility: visible; }
            .qr-poster {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              transform: none !important;
              width: 100vw !important;
              height: 100vh !important;
              box-shadow: none !important;
            }
            @page { margin: 0; size: ${size === "label" ? "100mm 100mm" : size}; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
