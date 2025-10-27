import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus } from "lucide-react";

export default function PDVBalcao() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balcão</h1>
          <p className="text-muted-foreground">
            Vendas rápidas para retirada no balcão
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedido Atual</CardTitle>
            <CardDescription>Adicione produtos ao pedido</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Carrinho vazio</h3>
                <p className="text-sm text-muted-foreground">
                  Busque produtos para adicionar ao pedido
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Busque e adicione produtos</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4 text-muted-foreground">
              <p>Nenhum produto cadastrado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
