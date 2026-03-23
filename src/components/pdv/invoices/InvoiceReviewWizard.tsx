import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ParsedInvoice } from "@/lib/invoice/xml-parser";
import { EditableInvoiceData, parseInvoiceToEditable } from "@/types/invoice";
import { Step1InvoiceData } from "./review-steps/Step1InvoiceData";
import { Step2SupplierData } from "./review-steps/Step2SupplierData";
import { Step3FinancialData } from "./review-steps/Step3FinancialData";
import { Step4ProductsData } from "./review-steps/Step4ProductsData";
import { Step5FinalReview } from "./review-steps/Step5FinalReview";
import { useCreateSupplier } from "@/hooks/use-pdv-suppliers";
import { useCreateInvoice, useCreateInvoiceItems } from "@/hooks/use-pdv-invoices";
import { usePDVFinancialTransactions } from "@/hooks/use-pdv-financial-transactions";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InvoiceReviewWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ParsedInvoice | null;
  initialEditableData?: EditableInvoiceData | null;
}

const STEPS = [
  { id: 1, title: 'Dados da Nota' },
  { id: 2, title: 'Fornecedor' },
  { id: 3, title: 'Financeiro' },
  { id: 4, title: 'Produtos' },
  { id: 5, title: 'Revisão Final' },
];

export function InvoiceReviewWizard({
  open,
  onOpenChange,
  invoice,
  initialEditableData,
}: InvoiceReviewWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [editableData, setEditableData] = useState<EditableInvoiceData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSupplier = useCreateSupplier();
  const createInvoice = useCreateInvoice();
  const createInvoiceItems = useCreateInvoiceItems();
  const { createTransaction } = usePDVFinancialTransactions();
  const { createIngredient } = usePDVIngredients();

  // Initialize editable data when invoice or initialEditableData changes
  useEffect(() => {
    if (!open) return;
    
    if (initialEditableData) {
      setEditableData(initialEditableData);
      setCurrentStep(1);
    } else if (invoice) {
      console.log('✅ Inicializando wizard com dados da nota:', invoice);
      setEditableData(parseInvoiceToEditable(invoice));
      setCurrentStep(1);
    }
  }, [invoice, initialEditableData, open]);

  const handleUpdate = (updates: Partial<EditableInvoiceData>) => {
    if (editableData) {
      setEditableData({ ...editableData, ...updates });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!editableData) return;

    setIsSubmitting(true);
    try {
      // 1. Create or use existing supplier
      let supplierId = editableData.supplier.existingId;

      if (editableData.supplier.mode === 'new' && editableData.supplier.newData) {
        const newSupplier = await createSupplier.mutateAsync({
          name: editableData.supplier.newData.name,
          company_name: editableData.supplier.newData.company_name || null,
          cnpj: editableData.supplier.newData.cnpj || null,
          state_registration: editableData.supplier.newData.state_registration || null,
          phone: editableData.supplier.newData.phone || null,
          email: editableData.supplier.newData.email || null,
          address: editableData.supplier.newData.address || null,
          city: editableData.supplier.newData.city || null,
          state: editableData.supplier.newData.state || null,
          zip_code: editableData.supplier.newData.zip_code || null,
          is_active: true,
        });
        supplierId = newSupplier.id;
      }

      if (!supplierId) {
        throw new Error('Fornecedor não selecionado');
      }

      // 2. Create ingredients first (for items that need new ingredients)
      const ingredientMap = new Map<number, string>();
      for (let i = 0; i < editableData.items.length; i++) {
        const item = editableData.items[i];
        if (item.linkAction.type === 'create' && item.linkAction.newIngredientData) {
          const newIngredient: any = {
            name: item.linkAction.newIngredientData.name,
            code: item.linkAction.newIngredientData.code || null,
            ean: item.linkAction.newIngredientData.ean || null,
            unit: item.linkAction.newIngredientData.unit,
            current_stock: item.quantity,
            min_stock: item.linkAction.newIngredientData.min_stock,
            unit_cost: item.linkAction.newIngredientData.unit_cost,
            supplier_id: supplierId,
            category: item.linkAction.newIngredientData.category_id || null,
            loss_percentage: 0,
            selling_price: 0,
            icms_rate: 0,
            origin: 'nacional',
            automatic_output: 'none',
            max_stock: 0,
            real_cost: item.linkAction.newIngredientData.unit_cost,
            average_cost: item.linkAction.newIngredientData.unit_cost,
            ean_quantity: 1,
            purchase_lot: 1,
            current_balance: item.quantity,
          };

          createIngredient(newIngredient);
        }
      }

      // 3. Create financial transaction(s)
      const installments = editableData.financial.installments;
      const installmentAmount = editableData.financial.amount / installments;

      const transactionPromises = [];
      for (let i = 0; i < installments; i++) {
        const dueDate = new Date(editableData.financial.due_date);
        dueDate.setMonth(dueDate.getMonth() + i);

        transactionPromises.push(
          createTransaction({
            transaction_type: 'payable',
            description: installments > 1 
              ? `${editableData.financial.description} (${i + 1}/${installments})`
              : editableData.financial.description,
            amount: installmentAmount,
            due_date: dueDate.toISOString(),
            payment_date: editableData.financial.payment_date?.toISOString() || null,
            status: editableData.financial.status,
            supplier_id: supplierId,
            payment_method: editableData.financial.payment_method || null,
            document_number: editableData.invoiceKey,
            notes: editableData.financial.notes || null,
          })
        );
      }

      const transactions = await Promise.all(transactionPromises);
      const firstTransactionId = transactions[0].id;

      // 4. Create invoice record
      const invoiceRecord = await createInvoice.mutateAsync({
        invoice_number: editableData.invoiceNumber,
        invoice_key: editableData.invoiceKey,
        series: editableData.series,
        emission_date: editableData.emissionDate.toISOString(),
        entry_date: editableData.entryDate.toISOString(),
        supplier_id: supplierId,
        supplier_cnpj: editableData.supplier.newData?.cnpj || '',
        supplier_name: editableData.supplier.newData?.name || '',
        total_products: editableData.totals.products,
        total_tax: editableData.totals.tax,
        total_invoice: editableData.totals.invoice,
        freight_value: editableData.totals.freight,
        insurance_value: editableData.totals.insurance,
        other_expenses: editableData.totals.otherExpenses,
        discount_value: editableData.totals.discount,
        operation_type: editableData.operationType,
        invoice_type: 'compra',
        status: 'imported',
        financial_transaction_id: firstTransactionId,
        notes: editableData.notes || null,
      });

      // 5. Create invoice items
      const items = editableData.items.map((item, index) => ({
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
        ingredient_id: item.linkAction.type === 'link' ? item.linkAction.ingredientId || null : null,
        match_status: item.linkAction.type === 'none' ? 'unmatched' : 'matched',
      }));

      await createInvoiceItems.mutateAsync(items);

      toast.success('Nota fiscal importada com sucesso!');
      onOpenChange(false);
      setCurrentStep(1);
      setEditableData(null);
    } catch (error) {
      console.error('Erro ao importar nota:', error);
      toast.error('Erro ao importar nota fiscal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setEditableData(null);
      setCurrentStep(1);
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  // Guard clause: Show loading if data not ready
  if (!editableData) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Carregando dados da nota fiscal...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Nota Fiscal - {STEPS[currentStep - 1].title}</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`${
                  step.id === currentStep ? 'font-semibold text-foreground' : ''
                } ${step.id < currentStep ? 'text-primary' : ''}`}
              >
                {step.id}. {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {currentStep === 1 && (
            <Step1InvoiceData data={editableData} onUpdate={handleUpdate} />
          )}
          {currentStep === 2 && (
            <Step2SupplierData data={editableData} onUpdate={handleUpdate} />
          )}
          {currentStep === 3 && (
            <Step3FinancialData data={editableData} onUpdate={handleUpdate} />
          )}
          {currentStep === 4 && (
            <Step4ProductsData data={editableData} onUpdate={handleUpdate} />
          )}
          {currentStep === 5 && <Step5FinalReview data={editableData} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? 'Importando...' : 'Confirmar Importação'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
