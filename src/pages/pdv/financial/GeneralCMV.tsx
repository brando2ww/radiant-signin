import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";

export default function GeneralCMV() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CMV Geral</h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada do Custo das Mercadorias Vendidas
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CMV Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">no mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">no mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CMV %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground mt-1">sobre a receita</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">0%</div>
            <p className="text-xs text-muted-foreground mt-1">lucro bruto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do CMV</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>Gráfico de evolução do CMV em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição do CMV</CardTitle>
            <CardDescription>Por categoria de ingredientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <PieChart className="h-12 w-12 mb-2 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise Comparativa</CardTitle>
          <CardDescription>Desempenho vs mês anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CMV</p>
                <p className="text-lg font-bold">0%</p>
                <p className="text-xs text-muted-foreground">vs mês anterior</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <p className="text-lg font-bold">0%</p>
                <p className="text-xs text-muted-foreground">vs mês anterior</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margem</p>
                <p className="text-lg font-bold">0%</p>
                <p className="text-xs text-muted-foreground">vs mês anterior</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
          <CardDescription>Insights para melhorar sua margem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Configure receitas para todos os produtos para análise precisa do CMV</p>
            <p>• Mantenha o cadastro de ingredientes atualizado com preços corretos</p>
            <p>• Monitore produtos com margem abaixo de 30%</p>
            <p>• Considere ajuste de preços ou receitas para produtos com baixa margem</p>
            <p>• CMV ideal para restaurantes: 25% a 35% da receita</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
