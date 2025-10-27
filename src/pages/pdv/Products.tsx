import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

export default function PDVProducts() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu cardápio e fichas técnicas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Configure preços, receitas e disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[500px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
              <p className="text-sm text-muted-foreground">
                Comece criando seu primeiro produto
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Produto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
