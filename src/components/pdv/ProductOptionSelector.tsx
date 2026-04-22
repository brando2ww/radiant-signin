import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { PDVProductOption } from "@/hooks/use-pdv-product-options";

export interface SelectedOption {
  optionId: string;
  optionName: string;
  items: {
    itemId: string;
    itemName: string;
    priceAdjustment: number;
    linkedProductId?: string | null;
    printerStation?: string | null;
    recipes?: { ingredient_id: string; quantity: number }[];
  }[];
}

interface Props {
  options: PDVProductOption[];
  onConfirm: (selections: SelectedOption[]) => void;
  onBack: () => void;
}

function getItemPrice(item: any): number {
  if (item.linked_product) {
    return Number(item.linked_product.price_salon) || 0;
  }
  return Number(item.price_adjustment) || 0;
}

export function ProductOptionSelector({ options, onConfirm, onBack }: Props) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const handleSingleSelect = (optionId: string, itemId: string) => {
    setSelections((prev) => ({ ...prev, [optionId]: [itemId] }));
  };

  const handleMultipleToggle = (optionId: string, itemId: string) => {
    setSelections((prev) => {
      const current = prev[optionId] || [];
      const option = options.find((o) => o.id === optionId);
      if (current.includes(itemId)) {
        return { ...prev, [optionId]: current.filter((id) => id !== itemId) };
      }
      if (option && option.max_selections > 0 && current.length >= option.max_selections) {
        return prev;
      }
      return { ...prev, [optionId]: [...current, itemId] };
    });
  };

  const isValid = options.every((option) => {
    if (!option.is_required) return true;
    const selected = selections[option.id] || [];
    return selected.length >= (option.min_selections || 1);
  });

  const handleConfirm = () => {
    const result: SelectedOption[] = options
      .filter((opt) => (selections[opt.id] || []).length > 0)
      .map((opt) => ({
        optionId: opt.id,
        optionName: opt.name,
        items: (selections[opt.id] || []).map((itemId) => {
          const item = opt.items.find((i) => i.id === itemId)!;
          return {
            itemId: item.id,
            itemName: item.name,
            priceAdjustment: getItemPrice(item),
            linkedProductId: item.linked_product_id || null,
            printerStation: (item.linked_product as any)?.printer_station || null,
            recipes: (item.recipes || []).map((r: any) => ({
              ingredient_id: r.ingredient_id,
              quantity: Number(r.quantity) || 1,
            })),
          };
        }),
      }));
    onConfirm(result);
  };

  const totalExtra = Object.entries(selections).reduce((total, [optId, itemIds]) => {
    const option = options.find((o) => o.id === optId);
    if (!option) return total;
    return total + itemIds.reduce((sum, itemId) => {
      const item = option.items.find((i) => i.id === itemId);
      return sum + (item ? getItemPrice(item) : 0);
    }, 0);
  }, 0);

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-semibold">{option.name}</Label>
            {option.is_required && (
              <Badge variant="destructive" className="text-[10px]">Obrigatório</Badge>
            )}
            {option.type === "multiple" && option.max_selections > 0 && (
              <span className="text-xs text-muted-foreground">
                (máx. {option.max_selections})
              </span>
            )}
          </div>

          {option.type === "single" ? (
            <RadioGroup
              value={selections[option.id]?.[0] || ""}
              onValueChange={(v) => handleSingleSelect(option.id, v)}
            >
              {option.items.map((item) => {
                const price = getItemPrice(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={item.id} id={item.id} />
                      <Label htmlFor={item.id} className="cursor-pointer">{item.name}</Label>
                      {item.linked_product && (
                        <Badge variant="outline" className="text-[9px]">Produto</Badge>
                      )}
                    </div>
                    {price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        +R$ {price.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            <div className="space-y-1">
              {option.items.map((item) => {
                const checked = (selections[option.id] || []).includes(item.id);
                const price = getItemPrice(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={item.id}
                        checked={checked}
                        onCheckedChange={() => handleMultipleToggle(option.id, item.id)}
                      />
                      <Label htmlFor={item.id} className="cursor-pointer">{item.name}</Label>
                      {item.linked_product && (
                        <Badge variant="outline" className="text-[9px]">Produto</Badge>
                      )}
                    </div>
                    {price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        +R$ {price.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {totalExtra > 0 && (
        <div className="text-sm text-right text-muted-foreground">
          Adicionais: +R$ {totalExtra.toFixed(2)}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={handleConfirm} disabled={!isValid}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
