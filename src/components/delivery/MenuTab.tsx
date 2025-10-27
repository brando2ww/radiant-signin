import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CategoryList } from "./CategoryList";
import { ProductList } from "./ProductList";
import { CategoryDialog } from "./CategoryDialog";
import { ProductDialog } from "./ProductDialog";
import { useDeliveryCategories } from "@/hooks/use-delivery-categories";
import { useDeliveryProducts } from "@/hooks/use-delivery-products";
import { SeedDemoButton } from "./SeedDemoButton";

export const MenuTab = () => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useDeliveryCategories();
  const { data: products = [] } = useDeliveryProducts(selectedCategory || undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Cardápio</h2>
          <p className="text-sm text-muted-foreground">
            Organize categorias e produtos do seu delivery
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {products.length === 0 && categories.length === 0 && <SeedDemoButton />}
          <Button onClick={() => setIsCategoryDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
          <Button onClick={() => setIsProductDialogOpen(true)} size="sm" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        <div className="lg:col-span-2">
          <ProductList
            products={products}
            categoryId={selectedCategory}
          />
        </div>
      </div>

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />

      <ProductDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        categories={categories}
      />
    </div>
  );
};
