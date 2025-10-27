import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { ProductOption, ProductOptionItem } from "@/hooks/use-product-options";

interface ProductOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option?: ProductOption;
  productId: string;
  onSave: (option: Omit<ProductOption, "id" | "items"> & { items: Omit<ProductOptionItem, "id" | "option_id">[] }) => void;
}

export const ProductOptionDialog = ({
  open,
  onOpenChange,
  option,
  productId,
  onSave,
}: ProductOptionDialogProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"single" | "multiple">("single");
  const [isRequired, setIsRequired] = useState(false);
  const [minSelections, setMinSelections] = useState(0);
  const [maxSelections, setMaxSelections] = useState(1);
  const [items, setItems] = useState<Array<{ name: string; price_adjustment: number; is_available: boolean }>>([
    { name: "", price_adjustment: 0, is_available: true },
  ]);

  useEffect(() => {
    if (option) {
      setName(option.name);
      setType(option.type);
      setIsRequired(option.is_required);
      setMinSelections(option.min_selections);
      setMaxSelections(option.max_selections);
      setItems(
        option.items?.map((item) => ({
          name: item.name,
          price_adjustment: item.price_adjustment,
          is_available: item.is_available,
        })) || [{ name: "", price_adjustment: 0, is_available: true }]
      );
    } else {
      // Reset form for new option
      setName("");
      setType("single");
      setIsRequired(false);
      setMinSelections(0);
      setMaxSelections(1);
      setItems([{ name: "", price_adjustment: 0, is_available: true }]);
    }
  }, [option, open]);

  const handleAddItem = () => {
    setItems([...items, { name: "", price_adjustment: 0, is_available: true }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!name.trim() || items.some((item) => !item.name.trim())) {
      return;
    }

    onSave({
      product_id: productId,
      name: name.trim(),
      type,
      is_required: isRequired,
      min_selections: type === "multiple" ? minSelections : 0,
      max_selections: type === "multiple" ? maxSelections : 1,
      order_position: option?.order_position || 0,
      items: items.map((item, index) => ({
        ...item,
        order_position: index,
      })),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{option ? "Editar Opção" : "Nova Opção"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="option-name">Nome da Opção *</Label>
            <Input
              id="option-name"
              placeholder="Ex: Escolha o tamanho, Adicionais"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="option-type">Tipo de Seleção</Label>
              <Select value={type} onValueChange={(value: "single" | "multiple") => setType(value)}>
                <SelectTrigger id="option-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Escolha Única (Radio)</SelectItem>
                  <SelectItem value="multiple">Múltipla Escolha (Checkbox)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is-required" className="flex items-center gap-2">
                <Switch
                  id="is-required"
                  checked={isRequired}
                  onCheckedChange={setIsRequired}
                />
                <span>Opção Obrigatória</span>
              </Label>
            </div>
          </div>

          {type === "multiple" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min-selections">Mínimo de Seleções</Label>
                <Input
                  id="min-selections"
                  type="number"
                  min="0"
                  value={minSelections}
                  onChange={(e) => setMinSelections(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-selections">Máximo de Seleções</Label>
                <Input
                  id="max-selections"
                  type="number"
                  min="1"
                  value={maxSelections}
                  onChange={(e) => setMaxSelections(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Itens da Opção *</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Nome do item *"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ajuste de preço"
                        value={item.price_adjustment}
                        onChange={(e) => handleItemChange(index, "price_adjustment", Number(e.target.value))}
                        className="flex-1"
                      />
                      <Label className="flex items-center gap-2 whitespace-nowrap">
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={(checked) => handleItemChange(index, "is_available", checked)}
                        />
                        <span className="text-sm">Disponível</span>
                      </Label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {option ? "Salvar" : "Criar Opção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
