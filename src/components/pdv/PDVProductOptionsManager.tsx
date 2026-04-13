import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { usePDVProductOptions } from "@/hooks/use-pdv-product-options";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  productId?: string;
}

export function PDVProductOptionsManager({ productId }: Props) {
  const { options, createOption, deleteOption, updateOption, createItem, deleteItem, updateItem } = usePDVProductOptions(productId);
  const [newOptionName, setNewOptionName] = useState("");
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>({});

  if (!productId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Salve o produto primeiro para configurar opções
      </div>
    );
  }

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    createOption.mutate({ product_id: productId, name: newOptionName.trim() });
    setNewOptionName("");
  };

  const handleAddItem = (optionId: string) => {
    const name = newItemNames[optionId]?.trim();
    if (!name) return;
    const price = Number(newItemPrices[optionId] || 0);
    createItem.mutate({ option_id: optionId, name, price_adjustment: price });
    setNewItemNames((prev) => ({ ...prev, [optionId]: "" }));
    setNewItemPrices((prev) => ({ ...prev, [optionId]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nome da opção (ex: Tamanho, Adicionais...)"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())}
        />
        <Button onClick={handleAddOption} disabled={!newOptionName.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {options.map((option) => (
        <Card key={option.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{option.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={option.type}
                  onValueChange={(v) => updateOption.mutate({ id: option.id, type: v })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Única</SelectItem>
                    <SelectItem value="multiple">Múltipla</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Obrigatório</Label>
                  <Switch
                    checked={option.is_required}
                    onCheckedChange={(v) => updateOption.mutate({ id: option.id, is_required: v })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteOption.mutate(option.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {option.type === "multiple" && (
              <div className="flex gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Mín:</Label>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs"
                    value={option.min_selections}
                    onChange={(e) => updateOption.mutate({ id: option.id, min_selections: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Máx:</Label>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs"
                    value={option.max_selections}
                    onChange={(e) => updateOption.mutate({ id: option.id, max_selections: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {option.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-1">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {item.price_adjustment > 0 ? `+R$ ${Number(item.price_adjustment).toFixed(2)}` : "Incluso"}
                </span>
                <Switch
                  checked={item.is_available}
                  onCheckedChange={(v) => updateItem.mutate({ id: item.id, is_available: v })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteItem.mutate(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2 border-t">
              <Input
                placeholder="Nome do item"
                className="flex-1"
                value={newItemNames[option.id] || ""}
                onChange={(e) => setNewItemNames((prev) => ({ ...prev, [option.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem(option.id))}
              />
              <CurrencyInput
                value={newItemPrices[option.id] || ""}
                onChange={(v) => setNewItemPrices((prev) => ({ ...prev, [option.id]: v }))}
                placeholder="+ R$"
                className="w-28"
              />
              <Button size="sm" onClick={() => handleAddItem(option.id)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {options.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          Nenhuma opção cadastrada. Adicione opções como "Tamanho", "Adicionais", etc.
        </p>
      )}
    </div>
  );
}
