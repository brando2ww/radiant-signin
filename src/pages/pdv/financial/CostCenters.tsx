import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { usePDVCostCenters } from "@/hooks/use-pdv-cost-centers";
import { Badge } from "@/components/ui/badge";

export default function CostCenters() {
  const { costCenters, isLoading } = usePDVCostCenters();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centros de Custo</h1>
          <p className="text-muted-foreground mt-1">
            Rastreie despesas por setor ou departamento
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Centro de Custo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Centros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costCenters.length}</div>
            <p className="text-xs text-muted-foreground mt-1">ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cozinha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">gastos no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Salão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">gastos no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">gastos no mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centros de Custo Cadastrados</CardTitle>
          <CardDescription>Gerencie seus centros de custo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : costCenters.length > 0 ? (
            <div className="space-y-2">
              {costCenters.map((center) => (
                <div
                  key={center.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-medium">{center.name}</span>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum centro de custo cadastrado</p>
              <p className="text-sm mt-2">Organize suas despesas por setor</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
