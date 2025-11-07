import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Download } from "lucide-react";
import { InvoiceUploadDialog } from "@/components/pdv/invoices/InvoiceUploadDialog";
import { InvoiceReviewWizard } from "@/components/pdv/invoices/InvoiceReviewWizard";
import { InvoiceCard } from "@/components/pdv/invoices/InvoiceCard";
import { InvoiceFilters } from "@/components/pdv/invoices/InvoiceFilters";
import { usePDVInvoices, useDeleteInvoice, PDVInvoice } from "@/hooks/use-pdv-invoices";
import { ParsedInvoice } from "@/lib/invoice/xml-parser";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Invoices() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PDVInvoice | null>(null);

  const { invoices, isLoading } = usePDVInvoices({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const deleteInvoice = useDeleteInvoice();

  const handleParsed = (invoice: ParsedInvoice) => {
    setParsedInvoice(invoice);
    setReviewOpen(true);
  };

  const handleView = (invoice: PDVInvoice) => {
    console.log('View invoice:', invoice);
  };

  const handleDelete = (invoice: PDVInvoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedInvoice) {
      await deleteInvoice.mutateAsync(selectedInvoice.id);
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier_cnpj.includes(searchTerm.replace(/\D/g, ''));

    return matchesSearch;
  });

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    imported: invoices.filter(i => i.status === 'imported').length,
    totalValue: invoices.reduce((sum, i) => sum + Number(i.total_invoice), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notas Fiscais</h1>
          <p className="text-muted-foreground mt-1">
            Importe e gerencie suas notas fiscais
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Importar NF-e
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Importadas</p>
              <p className="text-2xl font-bold">{stats.imported}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <InvoiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("all");
        }}
      />

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma nota fiscal encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? "Tente ajustar os filtros"
                : "Importe sua primeira nota fiscal para começar"}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importar NF-e
              </Button>
            )}
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <InvoiceUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onParsed={handleParsed}
      />

      <InvoiceReviewWizard
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        invoice={parsedInvoice}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a nota fiscal {selectedInvoice?.invoice_number}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
