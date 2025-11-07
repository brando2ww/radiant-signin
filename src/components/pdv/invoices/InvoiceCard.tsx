import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PDVInvoice } from "@/hooks/use-pdv-invoices";
import { FileText, MoreVertical, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { formatCNPJ } from "@/lib/invoice/validators";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoiceCardProps {
  invoice: PDVInvoice;
  onView: (invoice: PDVInvoice) => void;
  onDelete: (invoice: PDVInvoice) => void;
}

export function InvoiceCard({ invoice, onView, onDelete }: InvoiceCardProps) {
  const getStatusBadge = () => {
    const variants: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      reviewed: { label: 'Revisada', variant: 'outline' },
      imported: { label: 'Importada', variant: 'default' },
      error: { label: 'Erro', variant: 'destructive' },
    };

    const status = variants[invoice.status] || variants.pending;
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">NF-e {invoice.invoice_number}</h3>
              {getStatusBadge()}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {invoice.supplier_name}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">CNPJ:</span> {formatCNPJ(invoice.supplier_cnpj)}
              </div>
              <div>
                <span className="font-medium">Emissão:</span>{' '}
                {format(new Date(invoice.emission_date), 'dd/MM/yyyy')}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Série:</span> {invoice.series || 'N/A'}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">
                  R$ {invoice.total_invoice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(invoice)}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(invoice)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
