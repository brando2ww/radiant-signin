import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeliveryCategories } from "@/hooks/use-delivery-categories";
import { useShareToDelivery } from "@/hooks/use-share-to-delivery";
import { PDVProduct } from "@/hooks/use-pdv-products";
import { Loader2 } from "lucide-react";

interface ShareToDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PDVProduct | null;
}

export function ShareToDeliveryDialog({
  open,
  onOpenChange,
  product,
}: ShareToDeliveryDialogProps) {
  const { data: categories = [], isLoading: loadingCategories } = useDeliveryCategories();
  const { mutate: share, isPending } = useShareToDelivery();
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");

  const handleOpenChange = (val: boolean) => {
    if (val && product) {
      setPrice(
        (product.price_delivery ?? product.price_salon).toFixed(2)
      );
      setCategoryId("");
    }
    onOpenChange(val);
  };

  const handleSubmit = () => {
    if (!product || !categoryId) return;
    share(
      { product, categoryId, basePrice: parseFloat(price) || 0 },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar para Delivery</DialogTitle>
          <DialogDescription>
            Selecione a categoria e confirme o preço para compartilhar este produto com o delivery. As alterações futuras feitas no PDV (dados básicos, opções e itens) serão refletidas automaticamente no cardápio do delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Produto</Label>
            <Input value={product?.name ?? ""} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Categoria do Delivery</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : activeCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria ativa no delivery. Crie uma categoria primeiro.
              </p>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preço no Delivery (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !categoryId || !price}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar para Delivery"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
