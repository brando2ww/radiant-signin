import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TopProductsListProps {
  products: Array<{
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  isLoading?: boolean;
}

export function TopProductsList({ products, isLoading }: TopProductsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma venda registrada nos últimos 7 dias
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>Últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.product_name} className="flex items-center gap-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index === 0
                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    : index === 1
                    ? "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                    : index === 2
                    ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < 3 ? (
                  <Trophy className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {product.product_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{product.total_quantity} vendidos</span>
                  <span>•</span>
                  <span className="text-success font-medium">
                    R$ {product.total_revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
