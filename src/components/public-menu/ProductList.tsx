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
    <div className="space-y-12 md:space-y-16">
      {featuredProducts.length > 0 && (
        <section id="cat-featured" className="scroll-mt-24">
          <div className="mb-5 border-b border-border pb-2">
            <div className="flex items-end justify-between gap-4">
              <h2 className="relative inline-block text-xl md:text-2xl font-semibold tracking-tight pb-2 -mb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary">
                <span className="mr-2">⭐</span>Destaques
              </h2>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {featuredProducts.length}{" "}
                {featuredProducts.length === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>
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
            <div className="mb-5 border-b border-border pb-2">
              <div className="flex items-end justify-between gap-4">
                <h2 className="relative inline-block text-xl md:text-2xl font-semibold tracking-tight pb-2 -mb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary">
                  {category.name}
                </h2>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {list.length} {list.length === 1 ? "item" : "itens"}
                </span>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-2">
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
