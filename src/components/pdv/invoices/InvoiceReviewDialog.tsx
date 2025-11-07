import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParsedInvoice, ParsedInvoiceItem } from "@/lib/invoice/xml-parser";
import { formatCNPJ, formatNFeKey } from "@/lib/invoice/validators";
import { usePDVSuppliers, useCreateSupplier } from "@/hooks/use-pdv-suppliers";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { useCreateInvoice, useCreateInvoiceItems } from "@/hooks/use-pdv-invoices";
import { usePDVFinancialTransactions } from "@/hooks/use-pdv-financial-transactions";
import { Check, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface InvoiceReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ParsedInvoice | null;
}

export function InvoiceReviewDialog({
  open,
  onOpenChange,
  invoice,
}: InvoiceReviewDialogProps) {
  const [notes, setNotes] = useState("");
  const [matchedItems, setMatchedItems] = useState<Map<number, string>>(new Map());
  
  const { suppliers } = usePDVSuppliers();
  const { ingredients } = usePDVIngredients();
  const createSupplier = useCreateSupplier();
  const createInvoice = useCreateInvoice();
  const createInvoiceItems = useCreateInvoiceItems();
  const { createTransaction } = usePDVFinancialTransactions();

  const [matchedSupplier, setMatchedSupplier] = useState<string | null>(null);

  useEffect(() => {
    if (invoice && suppliers.length > 0) {
      // Try to match supplier by CNPJ
      const found = suppliers.find(s => s.cnpj === invoice.supplier.cnpj);
      setMatchedSupplier(found?.id || null);
    }
  }, [invoice, suppliers]);

  useEffect(() => {
    if (invoice && ingredients.length > 0) {
      // Try to auto-match items by product code or name
      const matches = new Map<number, string>();
      
      invoice.items.forEach((item, index) => {
        const found = ingredients.find(ing => 
          ing.code === item.productCode ||
          ing.ean === item.productEan ||
          ing.name.toLowerCase() === item.productName.toLowerCase()
        );
        
        if (found) {
          matches.set(index, found.id);
        }
      });
      
      setMatchedItems(matches);
    }
  }, [invoice, ingredients]);

  const handleConfirm = async () => {
    if (!invoice) return;

    try {
      // 1. Create or use existing supplier
      let supplierId = matchedSupplier;
      
      if (!supplierId) {
        const newSupplier = await createSupplier.mutateAsync({
          name: invoice.supplier.name,
          company_name: invoice.supplier.companyName || invoice.supplier.name,
          cnpj: invoice.supplier.cnpj,
          phone: invoice.supplier.phone || null,
          email: invoice.supplier.email || null,
          address: invoice.supplier.address || null,
          city: invoice.supplier.city || null,
          state: invoice.supplier.state || null,
          zip_code: invoice.supplier.zipCode || null,
          state_registration: invoice.supplier.stateRegistration || null,
          is_active: true,
        });
        supplierId = newSupplier.id;
      }

      // 2. Create financial transaction
      const transaction = await createTransaction({
        transaction_type: 'payable',
        description: `NF-e ${invoice.invoiceNumber} - ${invoice.supplier.name}`,
        amount: invoice.totals.invoice,
        due_date: invoice.emissionDate.toISOString(),
        status: 'pending',
        supplier_id: supplierId,
        document_number: invoice.invoiceKey,
        notes: notes || null,
      });

      // 3. Create invoice record
      const invoiceRecord = await createInvoice.mutateAsync({
        invoice_number: invoice.invoiceNumber,
        invoice_key: invoice.invoiceKey,
        series: invoice.series || null,
        emission_date: invoice.emissionDate.toISOString(),
        entry_date: new Date().toISOString(),
        supplier_id: supplierId,
        supplier_cnpj: invoice.supplier.cnpj,
        supplier_name: invoice.supplier.name,
        total_products: invoice.totals.products,
        total_tax: invoice.totals.tax,
        total_invoice: invoice.totals.invoice,
        freight_value: invoice.totals.freight || null,
        insurance_value: invoice.totals.insurance || null,
        other_expenses: invoice.totals.otherExpenses || null,
        discount_value: invoice.totals.discount || null,
        operation_type: invoice.operationType,
        invoice_type: 'compra',
        status: 'imported',
        financial_transaction_id: transaction.id,
        notes: notes || null,
      });

      // 4. Create invoice items
      const items = invoice.items.map((item, index) => ({
        invoice_id: invoiceRecord.id,
        item_number: item.itemNumber,
        product_code: item.productCode || null,
        product_ean: item.productEan || null,
        product_name: item.productName,
        ncm: item.ncm || null,
        cfop: item.cfop || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_value: item.unitValue,
        total_value: item.totalValue,
        discount_value: item.discountValue || null,
        freight_value: item.freightValue || null,
        insurance_value: item.insuranceValue || null,
        other_expenses: item.otherExpenses || null,
        icms_value: item.taxes.icms || null,
        ipi_value: item.taxes.ipi || null,
        pis_value: item.taxes.pis || null,
        cofins_value: item.taxes.cofins || null,
        ingredient_id: matchedItems.get(index) || null,
        match_status: matchedItems.has(index) ? 'matched' : 'new',
      }));

      await createInvoiceItems.mutateAsync(items);

      toast.success('Nota fiscal importada com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao importar nota:', error);
      toast.error('Erro ao importar nota fiscal');
    }
  };

  if (!invoice) return null;

  const unmatchedItems = invoice.items.filter((_, index) => !matchedItems.has(index));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Revisar Importação da Nota Fiscal</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Invoice Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">Dados da Nota</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Chave</Label>
                  <p className="text-xs font-mono mt-1">{formatNFeKey(invoice.invoiceKey)}</p>
                </div>
                <div>
                  <Label>Número/Série</Label>
                  <p className="mt-1">{invoice.invoiceNumber}/{invoice.series}</p>
                </div>
                <div>
                  <Label>Emissão</Label>
                  <p className="mt-1">{format(invoice.emissionDate, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Badge variant={invoice.operationType === 'entrada' ? 'default' : 'secondary'}>
                    {invoice.operationType === 'entrada' ? 'Entrada' : 'Saída'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Supplier Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Fornecedor</h3>
                {matchedSupplier ? (
                  <Badge variant="outline" className="gap-1">
                    <Check className="h-3 w-3" /> Encontrado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Plus className="h-3 w-3" /> Será criado
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                <div>
                  <Label>Nome</Label>
                  <p className="mt-1">{invoice.supplier.name}</p>
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <p className="mt-1">{formatCNPJ(invoice.supplier.cnpj)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Produtos ({invoice.items.length})</h3>
                {unmatchedItems.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {unmatchedItems.length} novo(s)
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {invoice.items.map((item, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg text-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.quantity} {item.unit} × R$ {item.unitValue.toFixed(2)} = R$ {item.totalValue.toFixed(2)}
                        </p>
                      </div>
                      {matchedItems.has(index) ? (
                        <Badge variant="outline" className="gap-1">
                          <Check className="h-3 w-3" /> Vinculado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Novo</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-3">
              <h3 className="font-semibold">Valores</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Produtos</Label>
                  <p className="mt-1">R$ {invoice.totals.products.toFixed(2)}</p>
                </div>
                <div>
                  <Label>Impostos</Label>
                  <p className="mt-1">R$ {invoice.totals.tax.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <Label>Total da Nota</Label>
                  <p className="text-lg font-semibold mt-1">R$ {invoice.totals.invoice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre esta importação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={createInvoice.isPending || createInvoiceItems.isPending}
          >
            Confirmar Importação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
