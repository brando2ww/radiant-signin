import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Minus } from "lucide-react";
import { usePDVProducts } from "@/hooks/use-pdv-products";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onAddItem: (item: any) => void;
  source?: string;
}

export function AddItemDialog({
  open,
  onOpenChange,
  orderId,
  onAddItem,
  source = "salon",
}: AddItemDialogProps) {
  const { products } = usePDVProducts();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const getPrice = (product: any) => {
    if (source === "balcao") return product.price_balcao ?? product.price_salon;
    if (source === "delivery") return product.price_delivery ?? product.price_salon;
    return product.price_salon;
  };
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.is_available &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  const handleAddItem = () => {
    if (!selectedProduct) return;

    onAddItem({
      order_id: orderId,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity,
      unit_price: selectedProduct.price_salon,
      notes: notes.trim() || undefined,
    });

    // Reset
    setSelectedProduct(null);
    setQuantity(1);
    setNotes("");
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Pedido</DialogTitle>
          <DialogDescription>
            Selecione o produto e a quantidade
          </DialogDescription>
        </DialogHeader>

        {!selectedProduct ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="text-left p-3 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{product.name}</p>
                      <Badge variant="outline">{product.category}</Badge>
                      <p className="text-lg font-bold">
                        R$ {product.price_salon.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="font-semibold text-lg">{selectedProduct.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedProduct.category}
              </p>
              <p className="text-lg font-bold mt-2">
                R$ {selectedProduct.price_salon.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Observações (opcional)
              </label>
              <Textarea
                placeholder="Ex: Sem cebola, ponto da carne..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="text-xl font-bold">
                  R$ {(selectedProduct.price_salon * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {selectedProduct && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedProduct(null);
                setQuantity(1);
                setNotes("");
              }}
            >
              Voltar
            </Button>
          )}
          <Button onClick={handleAddItem} disabled={!selectedProduct}>
            Adicionar ao Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
