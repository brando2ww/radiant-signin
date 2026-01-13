import { useState, useMemo } from "react";
import { MessageCircle, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { QuotationRequest } from "@/hooks/use-pdv-quotations";
import { usePDVIngredientSuppliers } from "@/hooks/use-pdv-ingredient-suppliers";
import { generateQuotationMessage, openWhatsApp } from "@/lib/whatsapp-message";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface WhatsAppSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: QuotationRequest;
}

interface SupplierWithItems {
  id: string;
  name: string;
  phone: string | null;
  items: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
  }>;
}

export function WhatsAppSendDialog({
  open,
  onOpenChange,
  quotation,
}: WhatsAppSendDialogProps) {
  const { ingredientSuppliers } = usePDVIngredientSuppliers();
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());

  // Get suppliers for each ingredient in the quotation
  const suppliersWithItems = useMemo(() => {
    const supplierMap = new Map<string, SupplierWithItems>();

    quotation.items?.forEach((item) => {
      // Find all suppliers linked to this ingredient
      const linkedSuppliers = ingredientSuppliers.filter(
        (is) => is.ingredient_id === item.ingredient_id && is.supplier?.phone
      );

      linkedSuppliers.forEach((link) => {
        if (!link.supplier) return;

        const existing = supplierMap.get(link.supplier_id);
        if (existing) {
          existing.items.push({
            ingredientId: item.ingredient_id,
            ingredientName: item.ingredient?.name || "",
            quantity: item.quantity_needed,
            unit: item.unit,
          });
        } else {
          supplierMap.set(link.supplier_id, {
            id: link.supplier_id,
            name: link.supplier.name,
            phone: link.supplier.phone,
            items: [
              {
                ingredientId: item.ingredient_id,
                ingredientName: item.ingredient?.name || "",
                quantity: item.quantity_needed,
                unit: item.unit,
              },
            ],
          });
        }
      });
    });

    return Array.from(supplierMap.values());
  }, [quotation.items, ingredientSuppliers]);

  const handleToggleSupplier = (supplierId: string) => {
    const newSelected = new Set(selectedSuppliers);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSuppliers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.size === suppliersWithItems.length) {
      setSelectedSuppliers(new Set());
    } else {
      setSelectedSuppliers(new Set(suppliersWithItems.map((s) => s.id)));
    }
  };

  const handleSend = () => {
    const deadline = quotation.deadline ? new Date(quotation.deadline) : new Date();

    suppliersWithItems
      .filter((s) => selectedSuppliers.has(s.id) && s.phone)
      .forEach((supplier) => {
        const message = quotation.message_template || generateQuotationMessage(
          supplier.items.map((item) => ({
            ingredientName: item.ingredientName,
            quantity: item.quantity,
            unit: item.unit,
          })),
          deadline
        );

        // Open WhatsApp for each supplier
        openWhatsApp(supplier.phone!, message);
      });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WhatsAppIcon className="h-5 w-5 text-green-600" />
            Enviar Cotação via WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {suppliersWithItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum fornecedor vinculado aos ingredientes desta cotação.</p>
              <p className="text-sm mt-2">
                Vincule fornecedores aos ingredientes no cadastro de estoque.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedSuppliers.size} de {suppliersWithItems.length} selecionado(s)
                </span>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedSuppliers.size === suppliersWithItems.length
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
              </div>

              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {suppliersWithItems.map((supplier) => {
                    const isSelected = selectedSuppliers.has(supplier.id);
                    const hasPhone = !!supplier.phone;

                    return (
                      <div
                        key={supplier.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "border-primary bg-primary/5" : ""
                        } ${!hasPhone ? "opacity-50" : ""}`}
                        onClick={() => hasPhone && handleToggleSupplier(supplier.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={!hasPhone}
                            onCheckedChange={() =>
                              hasPhone && handleToggleSupplier(supplier.id)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{supplier.name}</span>
                              {!hasPhone && (
                                <Badge variant="secondary" className="text-xs">
                                  Sem WhatsApp
                                </Badge>
                              )}
                            </div>
                            {hasPhone && (
                              <span className="text-sm text-muted-foreground">
                                {supplier.phone}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {supplier.items.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item.ingredientName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <p>
                  <strong>Dica:</strong> O sistema abrirá o WhatsApp Web para cada
                  fornecedor selecionado com a mensagem pronta. Você precisará clicar
                  em "Enviar" para cada um.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedSuppliers.size === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <WhatsAppIcon className="h-4 w-4 mr-2" />
            Abrir WhatsApp ({selectedSuppliers.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
