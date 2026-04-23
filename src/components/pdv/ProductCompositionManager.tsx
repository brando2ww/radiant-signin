import { useState } from "react";
import { useProductCompositions } from "@/hooks/use-pdv-compositions";
import { usePDVProducts } from "@/hooks/use-pdv-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatBRL } from "@/lib/format";
import {
  AlertTriangle,
  Info,
  Layers,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductCompositionManagerProps {
  productId: string;
  productPrice: number;
  isComposite: boolean;
  stockDeductionMode: string;
  onCompositeChange: (value: boolean) => void;
  onStockDeductionModeChange: (value: string) => void;
}

export function ProductCompositionManager({
  productId,
  productPrice,
  isComposite,
  stockDeductionMode,
  onCompositeChange,
  onStockDeductionModeChange,
}: ProductCompositionManagerProps) {
  const {
    compositions,
    isLoading,
    addComposition,
    isAdding,
    updateQuantity,
    removeComposition,
    calculateCompositionCost,
  } = useProductCompositions(productId);
  const { products } = usePDVProducts();
  const [searchOpen, setSearchOpen] = useState(false);

  const compositionCost = calculateCompositionCost(compositions);
  const margin = productPrice - compositionCost;
  const marginPercent = productPrice > 0 ? (margin / productPrice) * 100 : 0;

  const availableProducts = products.filter(
    (p) =>
      p.id !== productId &&
      !compositions.some((c) => c.child_product_id === p.id)
  );

  const handleAddProduct = (childProductId: string) => {
    addComposition({
      parentProductId: productId,
      childProductId,
      quantity: 1,
    });
    setSearchOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base font-medium">Produto Composto</Label>
          <p className="text-sm text-muted-foreground">
            Este produto é montado a partir de outros produtos cadastrados
          </p>
        </div>
        <Switch checked={isComposite} onCheckedChange={onCompositeChange} />
      </div>

      {!isComposite ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
          <Layers className="h-10 w-10" />
          <p className="text-sm">
            Ative para montar este produto a partir de sub-produtos
          </p>
        </div>
      ) : (
        <>
          {/* Search & Add */}
          <div>
            <Label className="mb-2 block">Adicionar Sub-produto</Label>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={isAdding}
                >
                  <Search className="h-4 w-4" />
                  Buscar produto para adicionar...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por nome..." />
                  <CommandList>
                    <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                    <CommandGroup>
                      {availableProducts.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.name}
                          onSelect={() => handleAddProduct(p.id)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddProduct(p.id);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{p.name}</span>
                              {p.ean && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {p.ean}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatBRL(p.price_salon)}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Composition List */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : compositions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-md border-dashed">
              <Plus className="h-6 w-6 mx-auto mb-2" />
              Nenhum sub-produto adicionado
            </div>
          ) : (
            <div className="space-y-2">
              {compositions.map((comp) => {
                const child = comp.child_product;
                const unitPrice = child?.price_salon || 0;
                const totalPrice = unitPrice * comp.quantity;
                const childIsComposite = (child as any)?.is_composite;
                const childMissingStation = !!child && !(child as any)?.printer_station;

                return (
                  <div
                    key={comp.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {child?.name || "Produto removido"}
                        </span>
                        {childIsComposite && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1 shrink-0"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Composto
                          </Badge>
                        )}
                        {childMissingStation && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1 shrink-0 border-destructive/40 text-destructive"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Sem centro de produção
                          </Badge>
                        )}
                      </div>
                      {child?.ean && (
                        <span className="text-xs text-muted-foreground">
                          EAN: {child.ean}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={comp.quantity}
                        onChange={(e) =>
                          updateQuantity({
                            id: comp.id,
                            quantity: Number(e.target.value) || 1,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        className="w-20 h-8 text-center text-sm"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        un
                      </span>
                    </div>

                    <div className="text-right shrink-0 w-24">
                      <p className="text-xs text-muted-foreground">
                        {formatBRL(unitPrice)}/un
                      </p>
                      <p className="text-sm font-medium">
                        {formatBRL(totalPrice)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeComposition(comp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Totals */}
          {compositions.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Custo da composição
                </span>
                <span className="font-medium">
                  {formatBRL(compositionCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço de venda</span>
                <span className="font-medium">
                  {formatBRL(productPrice)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Margem estimada</span>
                <span
                  className={`font-bold ${margin >= 0 ? "text-emerald-600" : "text-destructive"}`}
                >
                  {formatBRL(margin)} ({marginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {/* Stock deduction mode */}
          <div>
            <Label className="mb-2 block">Baixa de estoque ao vender</Label>
            <Select
              value={stockDeductionMode}
              onValueChange={onStockDeductionModeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">
                  Baixar estoque do produto principal
                </SelectItem>
                <SelectItem value="components">
                  Baixar estoque de cada sub-produto
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fiscal notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              A tributação utilizada na venda é a do produto principal. Os
              sub-produtos mantêm seus próprios cadastros fiscais para uso
              individual.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
