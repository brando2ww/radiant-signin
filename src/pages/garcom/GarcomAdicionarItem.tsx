import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Minus, Send } from "lucide-react";
import { usePDVProducts } from "@/hooks/use-pdv-products";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { toast } from "sonner";
import { ProductCategoryNav } from "@/components/garcom/ProductCategoryNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function GarcomAdicionarItem() {
  const { id: comandaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, isLoading } = usePDVProducts();
  const { addItem, isAddingItem, getItemsByComanda, sendToKitchen } = usePDVComandas();

  const items = comandaId ? getItemsByComanda(comandaId) : [];
  const pendingItems = items.filter(
    (i) => i.kitchen_status === "pendente" && !i.sent_to_kitchen_at
  );
  const pendingTotal = pendingItems.reduce((sum, i) => sum + Number(i.subtotal), 0);

  const handleSendToKitchen = () => {
    if (pendingItems.length === 0) return;
    const missingCenter = pendingItems.some((i) => !i.production_center_id);
    if (missingCenter) {
      toast.warning("Alguns itens não têm centro de produção configurado e podem não ser impressos.");
    }
    sendToKitchen(pendingItems.map((i) => i.id));
  };

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<typeof products extends (infer T)[] ? T : never | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const available = (products ?? []).filter((p) => p.is_available);
  const categories = [...new Set(available.map((p) => p.category))].sort();

  const filtered = available.filter((p) => {
    const matchCat = !selectedCategory || p.category === selectedCategory;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = async () => {
    if (!selectedProduct || !comandaId) return;
    await addItem({
      comandaId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.price_salon,
      notes: notes || undefined,
    });
    setSelectedProduct(null);
    setQuantity(1);
    setNotes("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 safe-area-top">
        <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">Adicionar Item</h1>
      </header>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <ProductCategoryNav
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Product List */}
      <div className="flex-1 px-4 pb-32 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground text-sm">
            Nenhum produto encontrado
          </p>
        ) : (
          filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                setSelectedProduct(product);
                setQuantity(1);
                setNotes("");
              }}
              className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left active:scale-[0.98] transition-transform"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-12 w-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-muted shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <span className="shrink-0 font-semibold text-sm tabular-nums">
                R$ {product.price_salon.toFixed(2)}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Product Detail Sheet */}
      <Sheet open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader>
            <SheetTitle className="text-left">{selectedProduct?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantidade</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border active:scale-95 transition-transform"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border active:scale-95 transition-transform"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                placeholder="Ex: sem cebola, ponto bem passado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 rounded-xl resize-none"
                rows={2}
              />
            </div>

            {/* Add Button */}
            <Button
              className="w-full h-12 text-base active:scale-[0.98] transition-transform"
              onClick={handleAdd}
              disabled={isAddingItem}
            >
              Adicionar · R${" "}
              {((selectedProduct?.price_salon ?? 0) * quantity).toFixed(2)}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
