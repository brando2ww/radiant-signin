import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Search, Loader2, Boxes, X, Package } from "lucide-react";
import {
  usePDVProductOptions,
  type PDVProductOption,
  type PDVOptionItemRecipeRef,
} from "@/hooks/use-pdv-product-options";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { usePDVProducts } from "@/hooks/use-pdv-products";
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

type DraftItem = PDVProductOption["items"][number] & {
  _isNew?: boolean;
  _deleted?: boolean;
};
type DraftOption = Omit<PDVProductOption, "items"> & {
  items: DraftItem[];
  _isNew?: boolean;
  _deleted?: boolean;
};

const isTempId = (id: string) => id.startsWith("tmp-");
const genId = (prefix: string) =>
  `tmp-${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const stripDraftFlags = (opts: DraftOption[]): DraftOption[] =>
  opts.map((o) => ({
    ...o,
    _isNew: undefined,
    _deleted: undefined,
    items: o.items.map((i) => ({ ...i, _isNew: undefined, _deleted: undefined })),
  }));

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
  const { products: pdvProducts = [] } = usePDVProducts();
  const { upsertRecipe, removeByOptionItem } = usePDVOptionRecipes();

  const [newOptionName, setNewOptionName] = useState("");
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>({});
  const [newItemKinds, setNewItemKinds] = useState<Record<string, "ingredient" | "product">>({});
  const [newItemIngredients, setNewItemIngredients] = useState<
    Record<string, { id: string; name: string; unit: string } | null>
  >({});
  const [newItemProducts, setNewItemProducts] = useState<
    Record<string, { id: string; name: string; price: number } | null>
  >({});
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState<string | null>(null);
  const [newItemProductPopoverOpen, setNewItemProductPopoverOpen] = useState<string | null>(null);
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState<string | null>(null);
  const [productPopoverOpen, setProductPopoverOpen] = useState<string | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [draft, setDraft] = useState<DraftOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const baselineRef = useRef<DraftOption[]>([]);

  // Sync draft with server data — preserves local-only drafts (_isNew, _deleted)
  // and any in-flight edits to existing options/items.
  useEffect(() => {
    setDraft((prev) => {
      const serverDeep = JSON.parse(JSON.stringify(options)) as DraftOption[];

      // First load: just hydrate from server.
      if (prev.length === 0) {
        baselineRef.current = JSON.parse(JSON.stringify(serverDeep));
        return serverDeep;
      }

      // No local edits: replace fully with server.
      const dirty = JSON.stringify(prev) !== JSON.stringify(baselineRef.current);
      if (!dirty) {
        baselineRef.current = JSON.parse(JSON.stringify(serverDeep));
        return serverDeep;
      }

      // Has local edits: keep them as-is. Only refresh baseline so isDirty
      // calculations stay correct against latest server state, but never
      // overwrite user's pending changes.
      const newBaseline: DraftOption[] = serverDeep.map((srvOpt) => {
        const draftOpt = prev.find((o) => o.id === srvOpt.id);
        if (!draftOpt) return srvOpt;
        // Keep only baseline items that still exist on server (don't add
        // newly fetched items into baseline as if they were locally-known).
        return srvOpt;
      });
      baselineRef.current = newBaseline;
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, productId]);

  const visibleDraft = useMemo(
    () =>
      draft
        .filter((o) => !o._deleted)
        .map((o) => ({ ...o, items: o.items.filter((i) => !i._deleted) })),
    [draft],
  );

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
    if (!newOptionName.trim()) {
      toast.warning("Informe o nome da opção");
      return;
    }
    const newOpt: DraftOption = {
      id: genId("opt"),
      product_id: productId,
      name: newOptionName.trim(),
      type: "single",
      is_required: false,
      min_selections: 0,
      max_selections: 1,
      order_position: draft.length,
      items: [],
      _isNew: true,
    };
    setDraft((prev) => [...prev, newOpt]);
    setNewOptionName("");
  };

  const handleAddItem = (optionId: string) => {
    const kind = newItemKinds[optionId] || "ingredient";
    const name = newItemNames[optionId]?.trim();
    if (!name) return;
    const price = Number(newItemPrices[optionId] || 0);
    const ing = newItemIngredients[optionId];
    const prod = newItemProducts[optionId];

    if (kind === "product" && !prod) {
      toast.warning("Selecione o produto vinculado");
      return;
    }

    const recipes: PDVOptionItemRecipeRef[] =
      kind === "ingredient" && ing
        ? [
            {
              id: `tmp-${ing.id}`,
              ingredient_id: ing.id,
              quantity: 1,
              unit: ing.unit,
              ingredient_name: ing.name,
              ingredient_unit: ing.unit,
            },
          ]
        : [];

    setDraft((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? {
              ...o,
              items: [
                ...o.items,
                {
                  id: genId("item"),
                  option_id: optionId,
                  name,
                  price_adjustment: price,
                  is_available: true,
                  order_position: o.items.length,
                  item_kind: kind,
                  linked_product_id: kind === "product" ? prod!.id : null,
                  recipes,
                  _isNew: true,
                } as DraftItem,
              ],
            }
          : o,
      ),
    );
    setNewItemNames((prev) => ({ ...prev, [optionId]: "" }));
    setNewItemPrices((prev) => ({ ...prev, [optionId]: "" }));
    setNewItemIngredients((prev) => ({ ...prev, [optionId]: null }));
    setNewItemProducts((prev) => ({ ...prev, [optionId]: null }));
    setNewItemKinds((prev) => ({ ...prev, [optionId]: "ingredient" }));
  };

  const handleSelectNewItemIngredient = (
    optionId: string,
    ingredient: { id: string; name: string; unit: string },
  ) => {
    setNewItemIngredients((prev) => ({ ...prev, [optionId]: ingredient }));
    setNewItemNames((prev) => ({ ...prev, [optionId]: ingredient.name }));
    setNewItemPopoverOpen(null);
    setIngredientSearch("");
  };

  const handleSelectNewItemProduct = (
    optionId: string,
    product: { id: string; name: string; price: number },
  ) => {
    setNewItemProducts((prev) => ({ ...prev, [optionId]: product }));
    setNewItemNames((prev) => ({ ...prev, [optionId]: product.name }));
    setNewItemPrices((prev) => ({ ...prev, [optionId]: String(product.price) }));
    setNewItemKinds((prev) => ({ ...prev, [optionId]: "product" }));
    setNewItemProductPopoverOpen(null);
    setProductSearch("");
  };

  const handleClearNewItemIngredient = (optionId: string) => {
    setNewItemIngredients((prev) => ({ ...prev, [optionId]: null }));
  };

  const handleClearNewItemProduct = (optionId: string) => {
    setNewItemProducts((prev) => ({ ...prev, [optionId]: null }));
    setNewItemKinds((prev) => ({ ...prev, [optionId]: "ingredient" }));
  };

  const handleLinkProductToItem = (
    optionId: string,
    itemId: string,
    product: { id: string; name: string; price: number },
  ) => {
    updateDraftItem(optionId, itemId, {
      item_kind: "product",
      linked_product_id: product.id,
      name: product.name,
      price_adjustment: product.price,
      recipes: [],
    } as any);
    setProductPopoverOpen(null);
    setProductSearch("");
  };

  const handleUnlinkProduct = (optionId: string, itemId: string) => {
    updateDraftItem(optionId, itemId, {
      item_kind: "ingredient",
      linked_product_id: null,
    } as any);
  };

  const handleDeleteOption = (optionId: string) => {
    setDraft((prev) => {
      const target = prev.find((o) => o.id === optionId);
      if (!target) return prev;
      // brand-new local-only option: just drop it.
      if (target._isNew) return prev.filter((o) => o.id !== optionId);
      return prev.map((o) => (o.id === optionId ? { ...o, _deleted: true } : o));
    });
  };

  const handleDeleteItem = (optionId: string, itemId: string) => {
    setDraft((prev) =>
      prev.map((o) => {
        if (o.id !== optionId) return o;
        const target = o.items.find((i) => i.id === itemId);
        if (!target) return o;
        if (target._isNew) {
          return { ...o, items: o.items.filter((i) => i.id !== itemId) };
        }
        return {
          ...o,
          items: o.items.map((i) => (i.id === itemId ? { ...i, _deleted: true } : i)),
        };
      }),
    );
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

    let created = 0;
    let updated = 0;
    let removed = 0;

    try {
      // ---- Phase 1: deletions (existing items, then existing options) ----
      const itemsToDelete: string[] = [];
      const optionsToDelete: string[] = [];
      draft.forEach((o) => {
        if (o._deleted && !isTempId(o.id)) {
          optionsToDelete.push(o.id);
          // Items inside a deleted option will cascade — no need to delete one by one.
        } else if (!o._deleted) {
          o.items.forEach((i) => {
            if (i._deleted && !isTempId(i.id)) itemsToDelete.push(i.id);
          });
        }
      });

      for (const id of itemsToDelete) {
        await deleteItem.mutateAsync(id);
        removed++;
      }
      for (const id of optionsToDelete) {
        await deleteOption.mutateAsync(id);
        removed++;
      }

      // ---- Phase 2: create new options & update existing ones ----
      // Map of tmp option id -> real id (for resolving items below).
      const optionIdMap = new Map<string, string>();

      for (const draftOpt of draft) {
        if (draftOpt._deleted) continue;

        if (draftOpt._isNew) {
          const result = await createOption.mutateAsync({
            product_id: productId,
            name: draftOpt.name,
            type: draftOpt.type,
            is_required: draftOpt.is_required,
            min_selections: draftOpt.min_selections,
            max_selections: draftOpt.max_selections,
          } as any);
          optionIdMap.set(draftOpt.id, (result as any).id);
          created++;
        } else {
          const baseOpt = baselineRef.current.find((o) => o.id === draftOpt.id);
          if (baseOpt) {
            const optChanges: Record<string, unknown> = {};
            (
              ["name", "type", "is_required", "min_selections", "max_selections"] as const
            ).forEach((k) => {
              if ((draftOpt as any)[k] !== (baseOpt as any)[k])
                optChanges[k] = (draftOpt as any)[k];
            });
            if (Object.keys(optChanges).length > 0) {
              await updateOption.mutateAsync({ id: draftOpt.id, ...optChanges } as any);
              updated++;
            }
          }
        }
      }

      // ---- Phase 3: items (create new, update existing) + recipes ----
      const itemIdMap = new Map<string, string>();

      for (const draftOpt of draft) {
        if (draftOpt._deleted) continue;
        const realOptionId = optionIdMap.get(draftOpt.id) || draftOpt.id;

        for (const draftItem of draftOpt.items) {
          if (draftItem._deleted) continue;

          let realItemId = draftItem.id;
          if (draftItem._isNew) {
            const result = await createItem.mutateAsync({
              option_id: realOptionId,
              name: draftItem.name,
              price_adjustment: draftItem.price_adjustment,
              item_kind: (draftItem as any).item_kind || "ingredient",
              linked_product_id: (draftItem as any).linked_product_id ?? null,
            } as any);
            realItemId = (result as any).id;
            itemIdMap.set(draftItem.id, realItemId);
            // Apply non-default fields if needed (is_available defaults to true on insert)
            if (draftItem.is_available === false) {
              await updateItem.mutateAsync({
                id: realItemId,
                is_available: false,
              } as any);
            }
            created++;
          } else {
            const baseOpt = baselineRef.current.find((o) => o.id === draftOpt.id);
            const baseItem = baseOpt?.items.find((i) => i.id === draftItem.id);
            if (baseItem) {
              const itemChanges: Record<string, unknown> = {};
              (["name", "price_adjustment", "is_available", "item_kind", "linked_product_id"] as const).forEach((k) => {
                if ((draftItem as any)[k] !== (baseItem as any)[k])
                  itemChanges[k] = (draftItem as any)[k];
              });
              if (Object.keys(itemChanges).length > 0) {
                await updateItem.mutateAsync({ id: draftItem.id, ...itemChanges } as any);
                updated++;
              }
            }
          }

          // ---- Recipes diff ----
          const draftRec = draftItem.recipes || [];
          const baseOpt = baselineRef.current.find((o) => o.id === draftOpt.id);
          const baseItem = baseOpt?.items.find((i) => i.id === draftItem.id);
          const baseRec = baseItem?.recipes || [];
          const draftKey = JSON.stringify(
            draftRec.map((r) => ({ ing: r.ingredient_id, qty: r.quantity })).sort(),
          );
          const baseKey = JSON.stringify(
            baseRec.map((r) => ({ ing: r.ingredient_id, qty: r.quantity })).sort(),
          );
          if (draftItem._isNew ? draftRec.length > 0 : draftKey !== baseKey) {
            if (!draftItem._isNew) {
              await removeByOptionItem(realItemId);
            }
            if (draftRec.length > 0) {
              await Promise.all(
                draftRec.map((r) =>
                  upsertRecipe({
                    optionItemId: realItemId,
                    ingredientId: r.ingredient_id,
                    quantity: Number(r.quantity) || 1,
                    unit: r.unit || "un",
                  }),
                ),
              );
            }
            updated++;
          }
        }
      }

      // Reset draft from server (invalidations will refetch); clear local state
      // so the sync effect repopulates from the fresh server snapshot.
      baselineRef.current = [];
      setDraft([]);

      const parts: string[] = [];
      if (created) parts.push(`${created} criada${created > 1 ? "s" : ""}`);
      if (updated) parts.push(`${updated} atualizada${updated > 1 ? "s" : ""}`);
      if (removed) parts.push(`${removed} removida${removed > 1 ? "s" : ""}`);
      toast.success(
        parts.length > 0 ? `Alterações salvas (${parts.join(", ")})` : "Alterações salvas",
      );
    } catch (err) {
      console.error("[PDVProductOptionsManager] save error", err);
      toast.error("Erro ao salvar algumas alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  );

  const filteredProducts = (excludeId?: string) =>
    pdvProducts.filter(
      (p) =>
        p.id !== excludeId &&
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
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
        <Button type="button" onClick={handleAddOption}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {visibleDraft.map((option) => (
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
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDeleteOption(option.id)}
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
              const isProductKind = (item as any).item_kind === "product";
              const linkedProductId = (item as any).linked_product_id as string | null | undefined;
              const linkedProduct = linkedProductId
                ? pdvProducts.find((p) => p.id === linkedProductId)
                : null;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-2 py-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className="gap-1 shrink-0"
                      title={isProductKind ? "Produto vinculado" : "Insumo / receita"}
                    >
                      {isProductKind ? (
                        <>
                          <Package className="h-3 w-3" /> Produto
                        </>
                      ) : (
                        <>
                          <Boxes className="h-3 w-3" /> Insumo
                        </>
                      )}
                    </Badge>
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

                    {!isProductKind && (
                      <Popover
                        modal
                        open={ingredientPopoverOpen === item.id}
                        onOpenChange={(open) => {
                          setIngredientPopoverOpen(open ? item.id : null);
                          if (!open) setIngredientSearch("");
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
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
                                    type="button"
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
                    )}

                    {isProductKind && (
                      <Popover
                        modal
                        open={productPopoverOpen === item.id}
                        onOpenChange={(open) => {
                          setProductPopoverOpen(open ? item.id : null);
                          if (!open) setProductSearch("");
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            title="Trocar produto vinculado"
                          >
                            <Package className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-2" align="end">
                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder="Buscar produto..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="pl-7 h-8 text-xs"
                                autoFocus
                              />
                            </div>
                            <ScrollArea className="h-48">
                              <div className="space-y-1">
                                {filteredProducts(productId).slice(0, 30).map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() =>
                                      handleLinkProductToItem(option.id, item.id, {
                                        id: p.id,
                                        name: p.name,
                                        price: Number(p.price_salon) || 0,
                                      })
                                    }
                                    className="w-full text-left p-2 rounded text-xs hover:bg-accent transition-colors"
                                  >
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-muted-foreground">
                                      {p.category}
                                    </p>
                                  </button>
                                ))}
                                {filteredProducts(productId).length === 0 && (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    Nenhum produto encontrado
                                  </p>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {(linkedRecipe || isProductKind) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() =>
                          isProductKind
                            ? handleUnlinkProduct(option.id, item.id)
                            : handleUnlinkIngredient(option.id, item.id)
                        }
                        title={isProductKind ? "Desvincular produto" : "Desvincular insumo"}
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
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteItem(option.id, item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {!isProductKind && linkedRecipe && (
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
                  {isProductKind && (
                    <div className="ml-7 flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                      <Badge variant="outline" className="gap-1">
                        <Package className="h-3 w-3" />
                        {linkedProduct ? linkedProduct.name : "Produto vinculado"}
                      </Badge>
                      <span className="text-muted-foreground">
                        usa receita e fiscal do produto
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Tipo:</Label>
                <Select
                  value={newItemKinds[option.id] || "ingredient"}
                  onValueChange={(v) => {
                    setNewItemKinds((prev) => ({ ...prev, [option.id]: v as any }));
                    if (v === "ingredient") {
                      setNewItemProducts((prev) => ({ ...prev, [option.id]: null }));
                    } else {
                      setNewItemIngredients((prev) => ({ ...prev, [option.id]: null }));
                    }
                  }}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredient">
                      <span className="inline-flex items-center gap-1">
                        <Boxes className="h-3 w-3" /> Insumo / Receita
                      </span>
                    </SelectItem>
                    <SelectItem value="product">
                      <span className="inline-flex items-center gap-1">
                        <Package className="h-3 w-3" /> Produto cadastrado
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {newItemProducts[option.id] && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Package className="h-3 w-3" />
                    {newItemProducts[option.id]?.name}
                    <button
                      type="button"
                      onClick={() => handleClearNewItemProduct(option.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={
                    (newItemKinds[option.id] || "ingredient") === "product"
                      ? "Nome (preenche ao escolher produto)"
                      : "Nome do item"
                  }
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

                {(newItemKinds[option.id] || "ingredient") === "ingredient" ? (
                  <Popover
                    modal
                    open={newItemPopoverOpen === option.id}
                    onOpenChange={(open) => {
                      setNewItemPopoverOpen(open ? option.id : null);
                      if (!open) setIngredientSearch("");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={newItemIngredients[option.id] ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        title={
                          newItemIngredients[option.id]
                            ? `Insumo: ${newItemIngredients[option.id]?.name}`
                            : "Vincular insumo"
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
                                type="button"
                                onClick={() =>
                                  handleSelectNewItemIngredient(option.id, ing)
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
                ) : (
                  <Popover
                    modal
                    open={newItemProductPopoverOpen === option.id}
                    onOpenChange={(open) => {
                      setNewItemProductPopoverOpen(open ? option.id : null);
                      if (!open) setProductSearch("");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={newItemProducts[option.id] ? "secondary" : "default"}
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        title={
                          newItemProducts[option.id]
                            ? `Produto: ${newItemProducts[option.id]?.name}`
                            : "Selecionar produto cadastrado"
                        }
                      >
                        <Package className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2" align="end">
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Buscar produto..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-7 h-8 text-xs"
                            autoFocus
                          />
                        </div>
                        <ScrollArea className="h-48">
                          <div className="space-y-1">
                            {filteredProducts(productId).slice(0, 30).map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  handleSelectNewItemProduct(option.id, {
                                    id: p.id,
                                    name: p.name,
                                    price: Number(p.price_salon) || 0,
                                  })
                                }
                                className="w-full text-left p-2 rounded text-xs hover:bg-accent transition-colors"
                              >
                                <p className="font-medium">{p.name}</p>
                                <p className="text-muted-foreground">{p.category}</p>
                              </button>
                            ))}
                            {filteredProducts(productId).length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                Nenhum produto encontrado
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {newItemIngredients[option.id] && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground"
                    onClick={() => handleClearNewItemIngredient(option.id)}
                    title="Remover insumo selecionado"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button type="button" size="sm" onClick={() => handleAddItem(option.id)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {visibleDraft.length === 0 && (
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
