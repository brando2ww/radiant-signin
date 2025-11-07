import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, FileCode } from "lucide-react";
import { useInvoiceParser } from "@/hooks/use-invoice-parser";
import { ParsedInvoice } from "@/lib/invoice/xml-parser";
import { toast } from "sonner";

interface InvoiceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParsed: (invoice: ParsedInvoice) => void;
}

export function InvoiceUploadDialog({
  open,
  onOpenChange,
  onParsed,
}: InvoiceUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const { parseXML, parsePDF, parsing } = useInvoiceParser();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'xml') {
      const result = await parseXML(file);
      if (result) {
        onParsed(result);
        onOpenChange(false);
      }
    } else if (extension === 'pdf') {
      const result = await parsePDF(file);
      if (result && result.invoice.invoiceKey) {
        // Convert partial to full parsed invoice
        toast.warning('PDF importado com dados parciais - recomenda-se usar XML para importação completa');
        // For now, we'll skip PDF import and ask for XML
        toast.error('Por favor, use o arquivo XML da nota fiscal para importação completa');
      }
    } else {
      toast.error('Formato de arquivo não suportado. Use XML ou PDF.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Nota Fiscal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xml,.pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={parsing}
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: XML ou PDF da NFe
                </p>
              </div>

              {parsing && (
                <p className="text-sm text-primary">Processando arquivo...</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileCode className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-medium">XML</p>
                <p className="text-muted-foreground">Recomendado</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">PDF</p>
                <p className="text-muted-foreground">Dados parciais</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
