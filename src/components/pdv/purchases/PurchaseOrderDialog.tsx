import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePDVPurchaseOrders } from "@/hooks/use-pdv-purchase-orders";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { usePDVSuppliers } from "@/hooks/use-pdv-suppliers";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { formatCurrency } from "@/lib/whatsapp-message";

interface OrderItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderDialog({ open, onOpenChange }: PurchaseOrderDialogProps) {
  const { createOrder } = usePDVPurchaseOrders();
  const { ingredients } = usePDVIngredients();
  const { suppliers } = usePDVSuppliers();

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [expectedDelivery, setExpectedDelivery] = useState<Date>(addDays(new Date(), 7));
  const [discount, setDiscount] = useState(0);
  const [freight, setFreight] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const total = subtotal - discount + freight;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        ingredient_id: "",
        ingredient_name: "",
        quantity: 1,
        unit: "un",
        unit_price: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    if (field === "ingredient_id") {
      const ingredient = ingredients.find((i) => i.id === value);
      if (ingredient) {
        newItems[index] = {
          ...newItems[index],
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          unit: ingredient.unit,
        };
      }
    } else if (field === "quantity") {
      newItems[index] = { ...newItems[index], quantity: value as number };
    } else if (field === "unit_price") {
      newItems[index] = { ...newItems[index], unit_price: value as number };
    }
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!supplierId || items.length === 0 || items.some((item) => !item.ingredient_id)) {
      return;
    }

    createOrder.mutate(
      {
        supplier_id: supplierId,
        expected_delivery: format(expectedDelivery, "yyyy-MM-dd"),
        discount,
        freight,
        payment_terms: paymentTerms,
        notes,
        items: items.map((item) => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
        })),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setSupplierId("");
    setItems([]);
    setExpectedDelivery(addDays(new Date(), 7));
    setDiscount(0);
    setFreight(0);
    setPaymentTerms("");
    setNotes("");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Novo Pedido de Compra</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Supplier */}
            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected Delivery */}
            <div className="space-y-2">
              <Label>Previsão de Entrega</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDelivery && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDelivery
                      ? format(expectedDelivery, "PPP", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expectedDelivery}
                    onSelect={(date) => date && setExpectedDelivery(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Itens do Pedido *</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                  Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md"
                    >
                      <div className="col-span-4">
                        <Label className="text-xs">Ingrediente</Label>
                        <Select
                          value={item.ingredient_id}
                          onValueChange={(value) =>
                            handleItemChange(index, "ingredient_id", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredients.map((ing) => (
                              <SelectItem key={ing.id} value={ing.id}>
                                {ing.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Qtd</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Unidade</Label>
                        <Input value={item.unit} disabled />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Preço Unit.</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            {items.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Desconto</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Frete</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={freight}
                      onChange={(e) => setFreight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label>Condições de Pagamento</Label>
              <Input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Ex: 30/60/90 dias"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o pedido..."
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !supplierId ||
              items.length === 0 ||
              items.some((item) => !item.ingredient_id) ||
              createOrder.isPending
            }
          >
            {createOrder.isPending ? "Criando..." : "Criar Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
