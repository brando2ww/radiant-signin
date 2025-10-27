import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Users } from "lucide-react";
import { PublicProduct } from "@/hooks/use-public-menu";
import { useState } from "react";
import { ProductDetailModal } from "./ProductDetailModal";
import { CartItem } from "@/pages/PublicMenu";

interface ProductCardProps {
  product: PublicProduct;
  onAddToCart: (item: CartItem) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasOptions = product.delivery_product_options && product.delivery_product_options.length > 0;
  const price = product.promotional_price || product.base_price;

  const handleQuickAdd = () => {
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      onAddToCart({
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: Number(price),
        selectedOptions: [],
      });
    }
  };

  return (
    <>
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsModalOpen(true)}
      >
        {product.image_url ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.promotional_price && (
              <Badge className="absolute top-2 right-2 bg-red-500">
                -{Math.round(((Number(product.base_price) - Number(product.promotional_price)) / Number(product.base_price)) * 100)}%
              </Badge>
            )}
          </div>
        ) : (
          <div className="h-48 w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Sem imagem</span>
          </div>
        )}
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{product.preparation_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Serve {product.serves}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {product.promotional_price ? (
                <div>
                  <p className="text-xs line-through text-muted-foreground">
                    R$ {Number(product.base_price).toFixed(2)}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(product.promotional_price).toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold">
                  R$ {Number(product.base_price).toFixed(2)}
                </p>
              )}
            </div>
            <Button
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAdd();
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={product}
        onAddToCart={onAddToCart}
      />
    </>
  );
};
