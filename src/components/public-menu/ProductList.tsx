import { PublicProduct, PublicCategory } from "@/hooks/use-public-menu";
import { ProductCard } from "./ProductCard";
import { CartItem } from "@/pages/PublicMenu";

interface ProductListProps {
  products: PublicProduct[];
  categories: PublicCategory[];
  onAddToCart: (item: CartItem) => void;
}

export const ProductList = ({ products, categories, onAddToCart }: ProductListProps) => {
  const featuredProducts = products.filter((p) => p.is_featured);

  const sortedCategories = [...categories].sort(
    (a, b) => (a.order_position || 0) - (b.order_position || 0)
  );

  const productsByCategory = new Map<string, PublicProduct[]>();
  for (const c of sortedCategories) productsByCategory.set(c.id, []);
  for (const p of products) {
    if (!productsByCategory.has(p.category_id)) {
      productsByCategory.set(p.category_id, []);
    }
    productsByCategory.get(p.category_id)!.push(p);
  }

  return (
    <div className="space-y-10">
      {featuredProducts.length > 0 && (
        <section id="cat-featured" className="scroll-mt-32">
          <h2 className="text-xl font-bold mb-4">⭐ Destaques</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={`featured-${product.id}`}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {sortedCategories.map((category) => {
        const list = productsByCategory.get(category.id) || [];
        if (list.length === 0) return null;

        return (
          <section
            key={category.id}
            id={`cat-${category.id}`}
            className="scroll-mt-24"
          >
            <span
              data-cat-anchor={category.id}
              aria-hidden="true"
              className="block h-0 scroll-mt-24"
            />
            <div className="pb-3 mb-4 border-b">
              <h2 className="text-xl font-bold">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </section>
        );
      })}

      {products.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          Nenhum produto disponível
        </div>
      )}
    </div>
  );
};
