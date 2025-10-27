import { PublicProduct } from "@/hooks/use-public-menu";
import { ProductCard } from "./ProductCard";
import { CartItem } from "@/pages/PublicMenu";

interface ProductListProps {
  products: PublicProduct[];
  onAddToCart: (item: CartItem) => void;
}

export const ProductList = ({ products, onAddToCart }: ProductListProps) => {
  const featuredProducts = products.filter((p) => p.is_featured);
  const regularProducts = products.filter((p) => !p.is_featured);

  return (
    <div className="space-y-8">
      {featuredProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">⭐ Destaques</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}

      {regularProducts.length > 0 && (
        <div>
          {featuredProducts.length > 0 && (
            <h2 className="text-xl font-bold mb-4">Cardápio</h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          Nenhum produto disponível
        </div>
      )}
    </div>
  );
};
