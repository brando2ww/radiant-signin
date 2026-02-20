import { useState, useMemo, useEffect } from "react";
import { MessageCircle, Check, Loader2 } from "lucide-react";
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
import { generateQuotationMessage } from "@/lib/whatsapp-message";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [isSending, setIsSending] = useState(false);

  // Fetch saved suppliers for this quotation's items
  const { data: savedItemSuppliers = [] } = useQuery({
    queryKey: ["quotation-item-suppliers", quotation.id],
    queryFn: async () => {
      const itemIds = quotation.items?.map((i) => i.id) || [];
      if (itemIds.length === 0) return [];

      const { data, error } = await supabase
        .from("pdv_quotation_item_suppliers")
        .select(`
          id,
          quotation_item_id,
          supplier_id,
          sent_at,
          supplier:pdv_suppliers(id, name, phone)
        `)
        .in("quotation_item_id", itemIds);

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!quotation.items?.length,
  });

  // Check if we have saved suppliers or should fallback to ingredient suppliers
  const hasSavedSuppliers = savedItemSuppliers.length > 0;

  // Get suppliers for each ingredient in the quotation
  const suppliersWithItems = useMemo(() => {
    const supplierMap = new Map<string, SupplierWithItems>();

    if (hasSavedSuppliers) {
      // Use saved suppliers from pdv_quotation_item_suppliers
      savedItemSuppliers.forEach((itemSupplier) => {
        const item = quotation.items?.find((i) => i.id === itemSupplier.quotation_item_id);
        if (!item || !itemSupplier.supplier) return;

        const supplier = itemSupplier.supplier as { id: string; name: string; phone: string | null };
        if (!supplier.phone) return;

        const existing = supplierMap.get(supplier.id);
        if (existing) {
          existing.items.push({
            ingredientId: item.ingredient_id,
            ingredientName: item.ingredient?.name || "",
            quantity: item.quantity_needed,
            unit: item.unit,
          });
        } else {
          supplierMap.set(supplier.id, {
            id: supplier.id,
            name: supplier.name,
            phone: supplier.phone,
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
    } else {
      // Fallback: use all ingredient suppliers (old behavior)
      quotation.items?.forEach((item) => {
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
    }

    return Array.from(supplierMap.values());
  }, [quotation.items, ingredientSuppliers, savedItemSuppliers, hasSavedSuppliers]);

  // Auto-select all suppliers when dialog opens (if we have saved suppliers)
  useEffect(() => {
    if (open && hasSavedSuppliers && suppliersWithItems.length > 0) {
      setSelectedSuppliers(new Set(suppliersWithItems.map((s) => s.id)));
    }
  }, [open, hasSavedSuppliers, suppliersWithItems]);

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

  const handleSend = async () => {
    const deadline = quotation.deadline ? new Date(quotation.deadline) : new Date();

    const suppliersToSend = suppliersWithItems.filter(
      (s) => selectedSuppliers.has(s.id) && s.phone
    );

    const suppliersPayload = suppliersToSend.map((supplier) => {
      const message = quotation.message_template || generateQuotationMessage(
        supplier.items.map((item) => ({
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit,
        })),
        deadline,
        undefined,
        quotation.request_number || undefined
      );
      return {
        supplierId: supplier.id,
        phone: supplier.phone!,
        message,
      };
    });

    const itemIds = quotation.items?.map((i) => i.id) || [];

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-quotation-whatsapp", {
        body: {
          quotationId: quotation.id,
          suppliers: suppliersPayload,
          itemIds,
        },
      });

      if (error) throw error;

      if (data?.code === "NO_WHATSAPP_CONNECTION") {
        toast.error("WhatsApp não conectado. Conecte nas configurações antes de enviar.");
        return;
      }

      if (data?.sent > 0) {
        toast.success(
          `${data.sent} mensagem${data.sent > 1 ? "s" : ""} enviada${data.sent > 1 ? "s" : ""} com sucesso!`
        );
      }

      if (data?.errors?.length > 0) {
        toast.warning(`${data.errors.length} envio(s) falharam. Verifique os logs.`);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error sending quotation via WhatsApp:", err);
      const message = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao enviar mensagens";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
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
              {hasSavedSuppliers && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Mostrando apenas os fornecedores selecionados durante a criação da cotação.
                </div>
              )}

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

            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedSuppliers.size === 0 || isSending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <WhatsAppIcon className="h-4 w-4 mr-2" />
                Enviar via WhatsApp ({selectedSuppliers.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
