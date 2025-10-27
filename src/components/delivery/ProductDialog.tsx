import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  DeliveryProduct,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-delivery-products";
import { DeliveryCategory } from "@/hooks/use-delivery-categories";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: DeliveryProduct;
  categories: DeliveryCategory[];
}

export const ProductDialog = ({
  open,
  onOpenChange,
  product,
  categories,
}: ProductDialogProps) => {
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [preparationTime, setPreparationTime] = useState("30");
  const [serves, setServes] = useState("1");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setCategoryId(product.category_id);
      setName(product.name);
      setDescription(product.description || "");
      setBasePrice(product.base_price.toString());
      setPromotionalPrice(product.promotional_price?.toString() || "");
      setPreparationTime(product.preparation_time.toString());
      setServes(product.serves.toString());
      setIsAvailable(product.is_available);
      setIsFeatured(product.is_featured);
    } else {
      setCategoryId(categories[0]?.id || "");
      setName("");
      setDescription("");
      setBasePrice("");
      setPromotionalPrice("");
      setPreparationTime("30");
      setServes("1");
      setIsAvailable(true);
      setIsFeatured(false);
    }
  }, [product, categories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      category_id: categoryId,
      name,
      description,
      base_price: Number(basePrice),
      promotional_price: promotionalPrice ? Number(promotionalPrice) : null,
      preparation_time: Number(preparationTime),
      serves: Number(serves),
      is_available: isAvailable,
      is_featured: isFeatured,
      image_url: null,
      order_position: 0,
    };

    if (product) {
      updateProduct.mutate(
        {
          id: product.id,
          updates: productData,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createProduct.mutate(productData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pizza Margherita"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Preço Base * (R$)</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionalPrice">Preço Promocional (R$)</Label>
              <Input
                id="promotionalPrice"
                type="number"
                step="0.01"
                min="0"
                value={promotionalPrice}
                onChange={(e) => setPromotionalPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Tempo de Preparo (min)</Label>
              <Input
                id="preparationTime"
                type="number"
                min="1"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serves">Serve (pessoas)</Label>
              <Input
                id="serves"
                type="number"
                min="1"
                value={serves}
                onChange={(e) => setServes(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="isAvailable">Disponível</Label>
              <Switch
                id="isAvailable"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isFeatured">Produto em destaque</Label>
              <Switch
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {product ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
