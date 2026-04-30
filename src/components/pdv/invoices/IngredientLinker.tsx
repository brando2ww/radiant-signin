import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePDVIngredients, type PDVIngredient } from "@/hooks/use-pdv-ingredients";
import { LinkActionType, NewIngredientData } from "@/types/invoice";
import { formatBRL } from "@/lib/format";

interface IngredientLinkerProps {
  itemName: string;
  itemCode?: string;
  itemEan?: string;
  itemUnit: string;
  itemUnitCost: number;
  linkAction: {
    type: LinkActionType;
    ingredientId?: string;
    newIngredientData?: NewIngredientData;
  };
  suggestedIngredientIds?: string[];
  autoMatched?: boolean;
  onLinkChange: (action: {
    type: LinkActionType;
    ingredientId?: string;
    newIngredientData?: NewIngredientData;
  }) => void;
}

export function IngredientLinker({
  itemName,
  itemCode,
  itemEan,
  itemUnit,
  itemUnitCost,
  linkAction,
  suggestedIngredientIds,
  autoMatched,
  onLinkChange,
}: IngredientLinkerProps) {
  const { ingredients } = usePDVIngredients();
  const [open, setOpen] = useState(false);

  const selectedIngredient = linkAction.ingredientId
    ? ingredients.find((i) => i.id === linkAction.ingredientId)
    : null;

  const suggestions: PDVIngredient[] = (suggestedIngredientIds || [])
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is PDVIngredient => !!i)
    .filter((i) => i.id !== linkAction.ingredientId)
    .slice(0, 3);

  const handleSelectExisting = (ingredientId: string) => {
    onLinkChange({ type: "link", ingredientId });
    setOpen(false);
  };

  const handleCreateNew = () => {
    onLinkChange({
      type: "create",
      newIngredientData: {
        name: itemName,
        code: itemCode,
        ean: itemEan,
        unit: itemUnit,
        min_stock: 0,
        unit_cost: itemUnitCost,
      },
    });
  };

  const handleRemoveLink = () => {
    onLinkChange({ type: "none" });
  };

  const handleUpdateNewIngredient = (field: keyof NewIngredientData, value: any) => {
    if (linkAction.type === "create" && linkAction.newIngredientData) {
      onLinkChange({
        type: "create",
        newIngredientData: {
          ...linkAction.newIngredientData,
          [field]: value,
        },
      });
    }
  };

  const showSuggestions = linkAction.type === "none" && suggestions.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-xs">Vinculação de Estoque</Label>
        {linkAction.type === "link" && autoMatched && (
          <Badge variant="outline" className="gap-1 border-primary text-primary">
            <Sparkles className="h-3 w-3" /> Vinculado automaticamente
          </Badge>
        )}
        {linkAction.type === "link" && !autoMatched && (
          <Badge variant="outline" className="gap-1">
            <Check className="h-3 w-3" /> Vinculado
          </Badge>
        )}
        {linkAction.type === "create" && (
          <Badge variant="secondary" className="gap-1">
            <Plus className="h-3 w-3" /> Criar Novo
          </Badge>
        )}
        {linkAction.type === "none" && (
          <Badge variant="outline" className="text-muted-foreground">
            Sem Vinculação
          </Badge>
        )}
      </div>

      {showSuggestions && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Sugestões para "{itemName}"
          </p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <Card key={s.id} className="p-2 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Estoque: {s.current_stock} {s.unit}
                    {s.code ? ` • Cód: ${s.code}` : ""}
                    {s.unit_cost ? ` • Últ. custo: ${formatBRL(s.unit_cost)}` : ""}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleSelectExisting(s.id)}>
                  Usar este
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {linkAction.type === "none" && (
        <div className="flex gap-2 flex-wrap">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-between flex-1 min-w-[200px]">
                Buscar outro insumo
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar insumo..." />
                <CommandList>
                  <CommandEmpty>Nenhum insumo encontrado.</CommandEmpty>
                  <CommandGroup>
                    {ingredients.map((ingredient) => (
                      <CommandItem
                        key={ingredient.id}
                        value={`${ingredient.name} ${ingredient.code || ""} ${ingredient.ean || ""}`}
                        onSelect={() => handleSelectExisting(ingredient.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIngredient?.id === ingredient.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{ingredient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ingredient.code && `Cód: ${ingredient.code}`}
                            {ingredient.ean && ` | EAN: ${ingredient.ean}`}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="secondary" size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo
          </Button>
        </div>
      )}

      {linkAction.type === "link" && selectedIngredient && (
        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">{selectedIngredient.name}</p>
              <p className="text-xs text-muted-foreground">
                Estoque atual: {selectedIngredient.current_stock} {selectedIngredient.unit}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveLink}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {linkAction.type === "create" && linkAction.newIngredientData && (
        <div className="bg-muted/50 p-3 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Novo Insumo</Label>
            <Button variant="ghost" size="sm" onClick={handleRemoveLink}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="new-name" className="text-xs">Nome</Label>
              <Input
                id="new-name"
                value={linkAction.newIngredientData.name}
                onChange={(e) => handleUpdateNewIngredient("name", e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="new-code" className="text-xs">Código</Label>
              <Input
                id="new-code"
                value={linkAction.newIngredientData.code || ""}
                onChange={(e) => handleUpdateNewIngredient("code", e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="new-ean" className="text-xs">EAN</Label>
              <Input
                id="new-ean"
                value={linkAction.newIngredientData.ean || ""}
                onChange={(e) => handleUpdateNewIngredient("ean", e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="new-unit" className="text-xs">Unidade</Label>
              <Input
                id="new-unit"
                value={linkAction.newIngredientData.unit}
                onChange={(e) => handleUpdateNewIngredient("unit", e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="new-min-stock" className="text-xs">Estoque Mínimo</Label>
              <Input
                id="new-min-stock"
                type="number"
                value={linkAction.newIngredientData.min_stock}
                onChange={(e) => handleUpdateNewIngredient("min_stock", parseFloat(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
