import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Minus, Loader2 } from "lucide-react";
import { usePDVProducts, PDVProduct } from "@/hooks/use-pdv-products";
import { cn } from "@/lib/utils";

interface ComandaAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (data: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function ComandaAddItemDialog({
  open,
  onOpenChange,
  onAddItem,
  isLoading,
}: ComandaAddItemDialogProps) {
  const { products = [], isLoading: isLoadingProducts } = usePDVProducts();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PDVProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.is_available &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()))
  );

  const getProductPrice = (product: PDVProduct) => {
    return product.price_salon || product.price_balcao || product.price_delivery || 0;
  };

  const handleSelectProduct = (product: PDVProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setNotes("");
  };

  const handleAddItem = async () => {
    if (!selectedProduct) return;

    await onAddItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: getProductPrice(selectedProduct),
      notes: notes || undefined,
    });

    // Reset and close
    setSelectedProduct(null);
    setQuantity(1);
    setNotes("");
    setSearch("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setNotes("");
    setSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Item</DialogTitle>
        </DialogHeader>

        {!selectedProduct ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Products list */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              {isLoadingProducts ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhum produto encontrado
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className={cn(
                        "w-full p-3 text-left rounded-lg border transition-all",
                        "hover:bg-accent hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.category && (
                            <p className="text-sm text-muted-foreground">
                              {product.category}
                            </p>
                          )}
                        </div>
                        <span className="font-bold">
                          R$ {getProductPrice(product).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <>
            {/* Selected product */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{selectedProduct.name}</p>
                  {selectedProduct.category && (
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.category}
                    </p>
                  )}
                </div>
                <span className="font-bold text-lg">
                  R$ {getProductPrice(selectedProduct).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center gap-4 py-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações (opcional)..."
                rows={2}
              />
            </div>

            {/* Total and actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>R$ {(getProductPrice(selectedProduct) * quantity).toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedProduct(null)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddItem}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Adicionar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
