import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { useFrequentProducts, CATEGORIES } from "@/hooks/use-product-expiry";

interface Props {
  onSelect: (product: { product_name: string; category: string }) => void;
}

export function FrequentProducts({ onSelect }: Props) {
  const { data: products } = useFrequentProducts();

  if (!products?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Cadastro Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => {
            const cat = CATEGORIES.find((c) => c.value === p.category);
            return (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onSelect({ product_name: p.name, category: p.category })}
              >
                {p.name}
                {cat && <Badge variant="secondary" className="ml-1 text-[9px] px-1">{cat.label}</Badge>}
                <span className="text-muted-foreground ml-1">({p.count})</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
