import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Search, Loader2, Boxes, X } from "lucide-react";
import {
  usePDVProductOptions,
  type PDVProductOption,
  type PDVOptionItemRecipeRef,
} from "@/hooks/use-pdv-product-options";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { usePDVOptionRecipes } from "@/hooks/use-pdv-option-recipes";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  productId?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

type DraftOption = PDVProductOption;

export function PDVProductOptionsManager({ productId, onDirtyChange }: Props) {
  const {
    options,
    createOption,
    deleteOption,
    updateOption,
    createItem,
    deleteItem,
    updateItem,
  } = usePDVProductOptions(productId);
  const { ingredients } = usePDVIngredients();
  const { upsertRecipe, removeByOptionItem } = usePDVOptionRecipes();

  const [newOptionName, setNewOptionName] = useState("");
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>({});
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState<string | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [draft, setDraft] = useState<DraftOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const baselineRef = useRef<DraftOption[]>([]);

  // Sync draft with server data when it changes (and we're not mid-edit)
  useEffect(() => {
    setDraft((prev) => {
      if (prev.length === 0) {
        baselineRef.current = JSON.parse(JSON.stringify(options));
        return JSON.parse(JSON.stringify(options));
      }
      const dirty = JSON.stringify(prev) !== JSON.stringify(baselineRef.current);
      if (!dirty) {
        baselineRef.current = JSON.parse(JSON.stringify(options));
        return JSON.parse(JSON.stringify(options));
      }
      // merge new server items
      const draftOptionIds = new Set(prev.map((o) => o.id));
      const merged = [...prev];
      options.forEach((srvOpt) => {
        if (!draftOptionIds.has(srvOpt.id)) {
          merged.push(JSON.parse(JSON.stringify(srvOpt)));
          baselineRef.current.push(JSON.parse(JSON.stringify(srvOpt)));
        } else {
          const draftOpt = merged.find((o) => o.id === srvOpt.id)!;
          const draftItemIds = new Set(draftOpt.items.map((i) => i.id));
          srvOpt.items.forEach((srvItem) => {
            if (!draftItemIds.has(srvItem.id)) {
              draftOpt.items.push(JSON.parse(JSON.stringify(srvItem)));
              const baseOpt = baselineRef.current.find((o) => o.id === srvOpt.id);
              if (baseOpt) baseOpt.items.push(JSON.parse(JSON.stringify(srvItem)));
            }
          });
          draftOpt.items = draftOpt.items.filter((i) =>
            srvOpt.items.some((s) => s.id === i.id),
          );
          const baseOpt = baselineRef.current.find((o) => o.id === srvOpt.id);
          if (baseOpt)
            baseOpt.items = baseOpt.items.filter((i) =>
              srvOpt.items.some((s) => s.id === i.id),
            );
        }
      });
      const serverIds = new Set(options.map((o) => o.id));
      const filtered = merged.filter((o) => serverIds.has(o.id));
      baselineRef.current = baselineRef.current.filter((o) => serverIds.has(o.id));
      return filtered;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, productId]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baselineRef.current),
    [draft],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  if (!productId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Salve o produto primeiro para configurar opções
      </div>
    );
  }

  const updateDraftOption = (optionId: string, patch: Partial<DraftOption>) => {
    setDraft((prev) => prev.map((o) => (o.id === optionId ? { ...o, ...patch } : o)));
  };

  const updateDraftItem = (
    optionId: string,
    itemId: string,
    patch: Partial<DraftOption["items"][number]>,
  ) => {
    setDraft((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : o,
      ),
    );
  };

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

  const handleLinkIngredient = (
    optionId: string,
    itemId: string,
    ingredient: { id: string; name: string; unit: string },
  ) => {
    const recipes: PDVOptionItemRecipeRef[] = [
      {
        id: `tmp-${ingredient.id}`,
        ingredient_id: ingredient.id,
        quantity: 1,
        unit: ingredient.unit,
        ingredient_name: ingredient.name,
        ingredient_unit: ingredient.unit,
      },
    ];
    updateDraftItem(optionId, itemId, { recipes });
    setIngredientPopoverOpen(null);
    setIngredientSearch("");
  };

  const handleUnlinkIngredient = (optionId: string, itemId: string) => {
    updateDraftItem(optionId, itemId, { recipes: [] });
  };

  const handleChangeRecipeQty = (
    optionId: string,
    itemId: string,
    qty: number,
  ) => {
    const item = draft.find((o) => o.id === optionId)?.items.find((i) => i.id === itemId);
    if (!item || !item.recipes || item.recipes.length === 0) return;
    const updated = item.recipes.map((r) => ({ ...r, quantity: qty }));
    updateDraftItem(optionId, itemId, { recipes: updated });
  };

  const handleDiscard = () => {
    setDraft(JSON.parse(JSON.stringify(baselineRef.current)));
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    const tasks: Promise<unknown>[] = [];
    let updatedCount = 0;

    draft.forEach((draftOpt) => {
      const baseOpt = baselineRef.current.find((o) => o.id === draftOpt.id);
      if (!baseOpt) return;

      const optChanges: Record<string, unknown> = {};
      (["name", "type", "is_required", "min_selections", "max_selections"] as const).forEach(
        (k) => {
          if ((draftOpt as any)[k] !== (baseOpt as any)[k])
            optChanges[k] = (draftOpt as any)[k];
        },
      );
      if (Object.keys(optChanges).length > 0) {
        tasks.push(updateOption.mutateAsync({ id: draftOpt.id, ...optChanges } as any));
        updatedCount++;
      }

      draftOpt.items.forEach((draftItem) => {
        const baseItem = baseOpt.items.find((i) => i.id === draftItem.id);
        if (!baseItem) return;
        const itemChanges: Record<string, unknown> = {};
        (["name", "price_adjustment", "is_available"] as const).forEach((k) => {
          if ((draftItem as any)[k] !== (baseItem as any)[k])
            itemChanges[k] = (draftItem as any)[k];
        });
        if (Object.keys(itemChanges).length > 0) {
          tasks.push(updateItem.mutateAsync({ id: draftItem.id, ...itemChanges } as any));
          updatedCount++;
        }

        // Recipe diff: compare by stringified
        const draftRec = draftItem.recipes || [];
        const baseRec = baseItem.recipes || [];
        const draftKey = JSON.stringify(
          draftRec.map((r) => ({ ing: r.ingredient_id, qty: r.quantity })).sort(),
        );
        const baseKey = JSON.stringify(
          baseRec.map((r) => ({ ing: r.ingredient_id, qty: r.quantity })).sort(),
        );
        if (draftKey !== baseKey) {
          if (draftRec.length === 0) {
            tasks.push(removeByOptionItem(draftItem.id));
          } else {
            // For now we support single ingredient per item; replace whole set
            tasks.push(
              removeByOptionItem(draftItem.id).then(() =>
                Promise.all(
                  draftRec.map((r) =>
                    upsertRecipe({
                      optionItemId: draftItem.id,
                      ingredientId: r.ingredient_id,
                      quantity: Number(r.quantity) || 1,
                      unit: r.unit || "un",
                    }),
                  ),
                ),
              ),
            );
          }
          updatedCount++;
        }
      });
    });

    try {
      await Promise.all(tasks);
      baselineRef.current = JSON.parse(JSON.stringify(draft));
      toast.success(
        `Opções salvas${updatedCount > 1 ? ` (${updatedCount} alterações)` : ""}`,
      );
    } catch (err) {
      toast.error("Erro ao salvar algumas alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  );

  return (
    <div className="space-y-4 pb-20">
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

      {draft.map((option) => (
        <Card key={option.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{option.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={option.type}
                  onValueChange={(v) => updateDraftOption(option.id, { type: v })}
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
                    onCheckedChange={(v) =>
                      updateDraftOption(option.id, { is_required: v })
                    }
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
                    onChange={(e) =>
                      updateDraftOption(option.id, {
                        min_selections: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Máx:</Label>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs"
                    value={option.max_selections}
                    onChange={(e) =>
                      updateDraftOption(option.id, {
                        max_selections: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {option.items.map((item) => {
              const linkedRecipe = item.recipes && item.recipes[0];
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-2 py-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateDraftItem(option.id, item.id, { name: e.target.value })
                      }
                      className="flex-1 h-8"
                    />
                    <CurrencyInput
                      value={String(item.price_adjustment || 0)}
                      onChange={(v) =>
                        updateDraftItem(option.id, item.id, {
                          price_adjustment: Number(v) || 0,
                        })
                      }
                      placeholder="+ R$"
                      className="w-24 h-8"
                    />
                    <Popover
                      open={ingredientPopoverOpen === item.id}
                      onOpenChange={(open) => {
                        setIngredientPopoverOpen(open ? item.id : null);
                        if (!open) setIngredientSearch("");
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant={linkedRecipe ? "secondary" : "ghost"}
                          size="icon"
                          className="h-8 w-8"
                          title={
                            linkedRecipe ? "Trocar insumo vinculado" : "Vincular insumo"
                          }
                        >
                          <Boxes className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-2" align="end">
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Buscar insumo..."
                              value={ingredientSearch}
                              onChange={(e) => setIngredientSearch(e.target.value)}
                              className="pl-7 h-8 text-xs"
                              autoFocus
                            />
                          </div>
                          <ScrollArea className="h-48">
                            <div className="space-y-1">
                              {filteredIngredients.slice(0, 30).map((ing) => (
                                <button
                                  key={ing.id}
                                  onClick={() =>
                                    handleLinkIngredient(option.id, item.id, ing)
                                  }
                                  className="w-full text-left p-2 rounded text-xs hover:bg-accent transition-colors"
                                >
                                  <p className="font-medium">{ing.name}</p>
                                  <p className="text-muted-foreground">
                                    Estoque: {ing.current_stock} {ing.unit}
                                  </p>
                                </button>
                              ))}
                              {filteredIngredients.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                  Nenhum insumo encontrado
                                </p>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {linkedRecipe && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => handleUnlinkIngredient(option.id, item.id)}
                        title="Desvincular insumo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(v) =>
                        updateDraftItem(option.id, item.id, { is_available: v })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteItem.mutate(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {linkedRecipe && (
                    <div className="ml-7 flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                      <Badge variant="outline" className="gap-1">
                        <Boxes className="h-3 w-3" />
                        {linkedRecipe.ingredient_name}
                      </Badge>
                      <span className="text-muted-foreground">consome</span>
                      <Input
                        type="number"
                        step="any"
                        min={0}
                        value={linkedRecipe.quantity}
                        onChange={(e) =>
                          handleChangeRecipeQty(
                            option.id,
                            item.id,
                            Number(e.target.value) || 0,
                          )
                        }
                        className="h-7 w-20 text-xs"
                      />
                      <span className="text-muted-foreground">
                        {linkedRecipe.ingredient_unit}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex gap-2 pt-2 border-t">
              <Input
                placeholder="Nome do item"
                className="flex-1"
                value={newItemNames[option.id] || ""}
                onChange={(e) =>
                  setNewItemNames((prev) => ({ ...prev, [option.id]: e.target.value }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddItem(option.id))
                }
              />
              <CurrencyInput
                value={newItemPrices[option.id] || ""}
                onChange={(v) =>
                  setNewItemPrices((prev) => ({ ...prev, [option.id]: v }))
                }
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

      {draft.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          Nenhuma opção cadastrada. Adicione opções como "Tamanho", "Adicionais", etc.
        </p>
      )}

      {/* Sticky save bar */}
      <div
        className={`sticky bottom-0 left-0 right-0 -mx-1 mt-4 flex items-center justify-between gap-3 rounded-md border bg-background/95 backdrop-blur px-3 py-2 shadow-sm transition-opacity ${
          isDirty ? "opacity-100" : "opacity-60"
        }`}
      >
        <span className="text-xs text-muted-foreground">
          {isDirty
            ? "Você tem alterações não salvas nas opções"
            : "Nenhuma alteração pendente"}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDiscard}
            disabled={!isDirty || isSaving}
          >
            Descartar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
