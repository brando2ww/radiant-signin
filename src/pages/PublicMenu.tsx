import { useParams } from "react-router-dom";
import { PublicMenuHeader } from "@/components/public-menu/PublicMenuHeader";
import { CategoryNav } from "@/components/public-menu/CategoryNav";
import { ProductList } from "@/components/public-menu/ProductList";
import { ShoppingCart } from "@/components/public-menu/ShoppingCart";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useState } from "react";
import { usePublicCategories, usePublicProducts } from "@/hooks/use-public-menu";

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: {
    optionId: string;
    optionName: string;
    itemId: string;
    itemName: string;
    priceAdjustment: number;
  }[];
  notes?: string;
}

const PublicMenu = () => {
  const { userId } = useParams<{ userId: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: categories = [] } = usePublicCategories(userId || "");
  const { data: products = [] } = usePublicProducts(
    userId || "",
    selectedCategory || undefined
  );

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">ID do estabelecimento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicMenuHeader userId={userId} />
      
      <div className="sticky top-0 z-30 bg-background border-b">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
        <ProductList products={products} onAddToCart={addToCart} />
      </div>

      <ShoppingCart
        cart={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        userId={userId}
      />

      <InstallPrompt />
    </div>
  );
};

export default PublicMenu;
