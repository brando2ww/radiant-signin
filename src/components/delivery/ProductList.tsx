import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { DeliveryProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-delivery-products";
import { useState } from "react";
import { ProductDialog } from "./ProductDialog";
import { useDeliveryCategories } from "@/hooks/use-delivery-categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductListProps {
  products: DeliveryProduct[];
  categoryId: string | null;
}

export const ProductList = ({ products, categoryId }: ProductListProps) => {
  const [editingProduct, setEditingProduct] = useState<DeliveryProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<DeliveryProduct | null>(null);
  const { data: categories = [] } = useDeliveryCategories();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleToggleAvailability = (product: DeliveryProduct) => {
    updateProduct.mutate({
      id: product.id,
      updates: { is_available: !product.is_available },
    });
  };

  const handleDelete = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Produtos</span>
            <Badge variant="secondary">{products.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {product.is_featured && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleToggleAvailability(product)}
                      >
                        {product.is_available ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {product.promotional_price ? (
                      <>
                        <span className="text-sm line-through text-muted-foreground">
                          R$ {Number(product.base_price).toFixed(2)}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          R$ {Number(product.promotional_price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">
                        R$ {Number(product.base_price).toFixed(2)}
                      </span>
                    )}
                    {!product.is_available && (
                      <Badge variant="outline">Indisponível</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {product.preparation_time} min
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Serve {product.serves}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {products.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              {categoryId
                ? "Nenhum produto nesta categoria"
                : "Nenhum produto cadastrado"}
            </p>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        product={editingProduct || undefined}
        categories={categories}
      />

      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{deletingProduct?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
