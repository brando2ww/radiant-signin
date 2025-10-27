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
import { ImageUpload } from "@/components/ui/image-upload";
import { useState, useEffect } from "react";
import {
  DeliveryProduct,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-delivery-products";
import { DeliveryCategory } from "@/hooks/use-delivery-categories";
import { useProductImageUpload } from "@/hooks/use-product-image-upload";
import { toast } from "sonner";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { uploadImage, deleteImage, isUploading } = useProductImageUpload();

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
      setCurrentImageUrl(product.image_url || null);
      setImageFile(null);
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
      setCurrentImageUrl(null);
      setImageFile(null);
    }
  }, [product, categories, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = currentImageUrl;

    // Upload new image if selected
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        // Delete old image if exists and is different
        if (currentImageUrl && currentImageUrl !== uploadedUrl) {
          await deleteImage(currentImageUrl);
        }
      } else {
        toast.error("Erro ao fazer upload da imagem");
        return;
      }
    }

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
      image_url: imageUrl,
      order_position: 0,
    };

    if (product) {
      updateProduct.mutate(
        {
          id: product.id,
          updates: productData,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            setImageFile(null);
          },
        }
      );
    } else {
      createProduct.mutate(productData, {
        onSuccess: () => {
          onOpenChange(false);
          setImageFile(null);
        },
      });
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      const success = await deleteImage(currentImageUrl);
      if (success) {
        setCurrentImageUrl(null);
        if (product) {
          updateProduct.mutate({
            id: product.id,
            updates: { image_url: null },
          });
        }
      }
    }
    setImageFile(null);
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
            <Label>Imagem do Produto</Label>
            <ImageUpload
              value={currentImageUrl || undefined}
              onChange={setImageFile}
              onRemove={handleRemoveImage}
              disabled={isUploading}
            />
          </div>

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
              disabled={createProduct.isPending || updateProduct.isPending || isUploading}
            >
              {isUploading ? "Enviando..." : product ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
