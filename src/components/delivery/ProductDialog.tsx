import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DeliveryProduct, useCreateProduct, useUpdateProduct } from "@/hooks/use-delivery-products";
import { DeliveryCategory } from "@/hooks/use-delivery-categories";
import { useProductImageUpload } from "@/hooks/use-product-image-upload";
import { ProductOptionsManager } from "./ProductOptionsManager";
import { DeliveryRecipeManager } from "./DeliveryRecipeManager";
import { CurrencyInput } from "@/components/ui/currency-input";
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

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
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
        { id: product.id, updates: productData },
        { onSuccess: () => { onOpenChange(false); setImageFile(null); } }
      );
    } else {
      createProduct.mutate(productData, {
        onSuccess: () => { onOpenChange(false); setImageFile(null); },
      });
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      const success = await deleteImage(currentImageUrl);
      if (success) {
        setCurrentImageUrl(null);
        if (product) {
          updateProduct.mutate({ id: product.id, updates: { image_url: null } });
        }
      }
    }
    setImageFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="options" disabled={!product}>
              Opções e Complementos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload value={currentImageUrl || undefined} onChange={setImageFile} onRemove={handleRemoveImage} disabled={isUploading} />
              
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço Base *</Label>
                  <CurrencyInput
                    value={basePrice}
                    onChange={setBasePrice}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Promocional</Label>
                  <CurrencyInput
                    value={promotionalPrice}
                    onChange={setPromotionalPrice}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo de Preparo (min)</Label>
                  <Input type="number" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Serve (pessoas)</Label>
                  <Input type="number" value={serves} onChange={(e) => setServes(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Disponível</Label>
                  <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Produto em destaque</Label>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending || isUploading}>
                  {isUploading ? "Enviando..." : product ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="options" className="mt-4">
            <ProductOptionsManager productId={product?.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};