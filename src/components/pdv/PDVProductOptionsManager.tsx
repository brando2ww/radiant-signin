import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Search, Loader2, Boxes, Unlink } from "lucide-react";
import { usePDVProductOptions, type PDVProductOption, type PDVOptionItemRecipeRef } from "@/hooks/use-pdv-product-options";
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
  const { options, createOption, deleteOption, updateOption, createItem, deleteItem, updateItem } = usePDVProductOptions(productId);
  const { products } = usePDVProducts();
  const [newOptionName, setNewOptionName] = useState("");
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>({});
  const [linkPopoverOpen, setLinkPopoverOpen] = useState<string | null>(null);
  const [linkSearch, setLinkSearch] = useState("");
  const [draft, setDraft] = useState<DraftOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const baselineRef = useRef<DraftOption[]>([]);

  // Sync draft with server data when it changes (and we're not mid-edit)
  useEffect(() => {
    setDraft((prev) => {
      // If draft is empty or productId changed, take server data as-is
      if (prev.length === 0) {
        baselineRef.current = JSON.parse(JSON.stringify(options));
        return JSON.parse(JSON.stringify(options));
      }
      // Otherwise, only sync if there are no local changes (preserve user edits)
      const isDirty = JSON.stringify(prev) !== JSON.stringify(baselineRef.current);
      if (!isDirty) {
        baselineRef.current = JSON.parse(JSON.stringify(options));
        return JSON.parse(JSON.stringify(options));
      }
      // Has local changes — merge: keep edits but reflect new IDs from server
      // Add any new options/items that exist on server but not in draft
      const draftOptionIds = new Set(prev.map((o) => o.id));
      const merged = [...prev];
      options.forEach((srvOpt) => {
        if (!draftOptionIds.has(srvOpt.id)) {
          merged.push(JSON.parse(JSON.stringify(srvOpt)));
          baselineRef.current.push(JSON.parse(JSON.stringify(srvOpt)));
        } else {
          // Sync new items inside existing options
          const draftOpt = merged.find((o) => o.id === srvOpt.id)!;
          const draftItemIds = new Set(draftOpt.items.map((i) => i.id));
          srvOpt.items.forEach((srvItem) => {
            if (!draftItemIds.has(srvItem.id)) {
              draftOpt.items.push(JSON.parse(JSON.stringify(srvItem)));
              const baseOpt = baselineRef.current.find((o) => o.id === srvOpt.id);
              if (baseOpt) baseOpt.items.push(JSON.parse(JSON.stringify(srvItem)));
            }
          });
          // Remove items deleted on server
          draftOpt.items = draftOpt.items.filter((i) => srvOpt.items.some((s) => s.id === i.id));
          const baseOpt = baselineRef.current.find((o) => o.id === srvOpt.id);
          if (baseOpt) baseOpt.items = baseOpt.items.filter((i) => srvOpt.items.some((s) => s.id === i.id));
        }
      });
      // Remove options deleted on server
      const serverIds = new Set(options.map((o) => o.id));
      const filtered = merged.filter((o) => serverIds.has(o.id));
      baselineRef.current = baselineRef.current.filter((o) => serverIds.has(o.id));
      return filtered;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, productId]);

  const isDirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(baselineRef.current);
  }, [draft]);

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

  const updateDraftItem = (optionId: string, itemId: string, patch: Partial<DraftOption["items"][number]>) => {
    setDraft((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : o
      )
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

  const handleLinkProduct = (optionId: string, itemId: string, linkedProductId: string, linkedProductName: string) => {
    const linked = products.find((p) => p.id === linkedProductId) || null;
    updateDraftItem(optionId, itemId, {
      linked_product_id: linkedProductId,
      name: linkedProductName,
      linked_product: linked as any,
    });
    setLinkPopoverOpen(null);
    setLinkSearch("");
  };

  const handleUnlinkProduct = (optionId: string, itemId: string) => {
    updateDraftItem(optionId, itemId, { linked_product_id: null, linked_product: null });
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
      (["name", "type", "is_required", "min_selections", "max_selections"] as const).forEach((k) => {
        if ((draftOpt as any)[k] !== (baseOpt as any)[k]) optChanges[k] = (draftOpt as any)[k];
      });
      if (Object.keys(optChanges).length > 0) {
        tasks.push(updateOption.mutateAsync({ id: draftOpt.id, ...optChanges } as any));
        updatedCount++;
      }

      draftOpt.items.forEach((draftItem) => {
        const baseItem = baseOpt.items.find((i) => i.id === draftItem.id);
        if (!baseItem) return;
        const itemChanges: Record<string, unknown> = {};
        (["name", "price_adjustment", "is_available", "linked_product_id"] as const).forEach((k) => {
          if ((draftItem as any)[k] !== (baseItem as any)[k]) itemChanges[k] = (draftItem as any)[k];
        });
        if (Object.keys(itemChanges).length > 0) {
          tasks.push(updateItem.mutateAsync({ id: draftItem.id, ...itemChanges } as any));
          updatedCount++;
        }
      });
    });

    try {
      await Promise.all(tasks);
      baselineRef.current = JSON.parse(JSON.stringify(draft));
      toast.success(`Opções salvas${updatedCount > 1 ? ` (${updatedCount} alterações)` : ""}`);
    } catch (err) {
      toast.error("Erro ao salvar algumas alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const availableProducts = products.filter(
    (p) =>
      p.id !== productId &&
      (p.name.toLowerCase().includes(linkSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(linkSearch.toLowerCase()))
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
                    onCheckedChange={(v) => updateDraftOption(option.id, { is_required: v })}
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
                    onChange={(e) => updateDraftOption(option.id, { min_selections: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Máx:</Label>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs"
                    value={option.max_selections}
                    onChange={(e) => updateDraftOption(option.id, { max_selections: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {option.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-2 py-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{item.name}</span>
                  {item.linked_product ? (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Link2 className="h-3 w-3" />
                      Vinculado
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {Number(item.price_adjustment) > 0 ? `+R$ ${Number(item.price_adjustment).toFixed(2)}` : "Incluso"}
                    </span>
                  )}
                  <Popover
                    open={linkPopoverOpen === item.id}
                    onOpenChange={(open) => {
                      setLinkPopoverOpen(open ? item.id : null);
                      if (!open) setLinkSearch("");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={item.linked_product ? "Trocar produto vinculado" : "Vincular produto"}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2" align="end">
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Buscar produto..."
                            value={linkSearch}
                            onChange={(e) => setLinkSearch(e.target.value)}
                            className="pl-7 h-8 text-xs"
                            autoFocus
                          />
                        </div>
                        <ScrollArea className="h-48">
                          <div className="space-y-1">
                            {availableProducts.slice(0, 20).map((p) => (
                              <button
                                key={p.id}
                                onClick={() => handleLinkProduct(option.id, item.id, p.id, p.name)}
                                className="w-full text-left p-2 rounded text-xs hover:bg-accent transition-colors"
                              >
                                <p className="font-medium">{p.name}</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>{p.category}</span>
                                  <span>R$ {p.price_salon.toFixed(2)}</span>
                                  {(p as any).ncm && <span>NCM: {(p as any).ncm}</span>}
                                </div>
                              </button>
                            ))}
                            {availableProducts.length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                Nenhum produto encontrado
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {item.linked_product && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => handleUnlinkProduct(option.id, item.id)}
                      title="Desvincular produto"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={(v) => updateDraftItem(option.id, item.id, { is_available: v })}
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
                {item.linked_product && (
                  <div className="ml-8 p-2 rounded bg-muted/50 text-xs text-muted-foreground space-y-0.5">
                    <p><span className="font-medium">Produto:</span> {item.linked_product.name} — R$ {item.linked_product.price_salon.toFixed(2)}</p>
                    {item.linked_product.ncm && <p><span className="font-medium">NCM:</span> {item.linked_product.ncm}</p>}
                    {item.linked_product.cfop && <p><span className="font-medium">CFOP:</span> {item.linked_product.cfop}</p>}
                  </div>
                )}
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
          {isDirty ? "Você tem alterações não salvas nas opções" : "Nenhuma alteração pendente"}
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
