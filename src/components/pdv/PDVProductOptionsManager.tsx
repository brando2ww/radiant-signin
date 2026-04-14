import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Link2, Unlink, Search } from "lucide-react";
import { usePDVProductOptions } from "@/hooks/use-pdv-product-options";
import { usePDVProducts } from "@/hooks/use-pdv-products";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { products } = usePDVProducts();
  const [newOptionName, setNewOptionName] = useState("");
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [newItemPrices, setNewItemPrices] = useState<Record<string, string>>({});
  const [linkPopoverOpen, setLinkPopoverOpen] = useState<string | null>(null);
  const [linkSearch, setLinkSearch] = useState("");

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

  const handleLinkProduct = (itemId: string, linkedProductId: string, linkedProductName: string) => {
    updateItem.mutate({ id: itemId, linked_product_id: linkedProductId, name: linkedProductName });
    setLinkPopoverOpen(null);
    setLinkSearch("");
  };

  const handleUnlinkProduct = (itemId: string) => {
    updateItem.mutate({ id: itemId, linked_product_id: null });
  };

  const availableProducts = products.filter(
    (p) =>
      p.id !== productId &&
      (p.name.toLowerCase().includes(linkSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(linkSearch.toLowerCase()))
  );

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
                                onClick={() => handleLinkProduct(item.id, p.id, p.name)}
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
                      onClick={() => handleUnlinkProduct(item.id)}
                      title="Desvincular produto"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                    </Button>
                  )}
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

      {options.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          Nenhuma opção cadastrada. Adicione opções como "Tamanho", "Adicionais", etc.
        </p>
      )}
    </div>
  );
}
