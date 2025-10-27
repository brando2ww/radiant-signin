import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopProduct } from "@/hooks/use-delivery-reports";
import { TrendingUp } from "lucide-react";

interface TopProductsProps {
  products: TopProduct[];
}

export const TopProducts = ({ products }: TopProductsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Produtos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum produto vendido no período
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">
                    R$ {product.revenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
