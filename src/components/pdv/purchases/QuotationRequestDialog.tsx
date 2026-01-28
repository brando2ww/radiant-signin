import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
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
import { usePDVQuotations } from "@/hooks/use-pdv-quotations";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { generateQuotationMessage } from "@/lib/whatsapp-message";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface QuotationItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity_needed: number;
  unit: string;
  notes?: string;
}

interface QuotationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedItems?: QuotationItem[];
}

export function QuotationRequestDialog({
  open,
  onOpenChange,
  preselectedItems,
}: QuotationRequestDialogProps) {
  const { createQuotation } = usePDVQuotations();
  const { ingredients } = usePDVIngredients();

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [deadline, setDeadline] = useState<Date>(addDays(new Date(), 3));
  const [notes, setNotes] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");

  // Initialize with preselected items
  useEffect(() => {
    if (open && preselectedItems && preselectedItems.length > 0) {
      setItems(preselectedItems);
    }
  }, [open, preselectedItems]);

  // Generate message template when items change
  useEffect(() => {
    if (items.length > 0) {
      const message = generateQuotationMessage(
        items.map((item) => ({
          ingredientName: item.ingredient_name,
          quantity: item.quantity_needed,
          unit: item.unit,
        })),
        deadline
      );
      setMessageTemplate(message);
    }
  }, [items, deadline]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        ingredient_id: "",
        ingredient_name: "",
        quantity_needed: 1,
        unit: "un",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
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
    } else if (field === "quantity_needed") {
      newItems[index] = { ...newItems[index], quantity_needed: value as number };
    }
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (items.length === 0 || items.some((item) => !item.ingredient_id)) {
      return;
    }

    createQuotation.mutate(
      {
        deadline: format(deadline, "yyyy-MM-dd"),
        notes,
        message_template: messageTemplate,
        items: items.map((item) => ({
          ingredient_id: item.ingredient_id,
          quantity_needed: item.quantity_needed,
          unit: item.unit,
          notes: item.notes,
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
    setItems([]);
    setDeadline(addDays(new Date(), 3));
    setNotes("");
    setMessageTemplate("");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Cotação</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Deadline */}
            <div className="space-y-2">
              <Label>Prazo para Respostas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline
                      ? format(deadline, "PPP", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => date && setDeadline(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Itens da Cotação</Label>
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
                      <div className="col-span-5">
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
                      <div className="col-span-3">
                        <Label className="text-xs">Quantidade</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity_needed}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity_needed",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Unidade</Label>
                        <Input value={item.unit} disabled />
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

            {/* Message Preview */}
            {items.length > 0 && (
              <div className="space-y-2">
                <Label>Mensagem para Fornecedores</Label>
                <Textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Esta mensagem será enviada via WhatsApp para os fornecedores selecionados.
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações internas sobre esta cotação..."
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
            disabled={items.length === 0 || items.some((item) => !item.ingredient_id) || createQuotation.isPending}
          >
            {createQuotation.isPending ? "Criando..." : "Criar Cotação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
