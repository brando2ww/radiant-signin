import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

export default function PDVReports() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e indicadores do PDV
          </p>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="cmv">CMV</TabsTrigger>
          <TabsTrigger value="cashier">Caixa</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Período</CardTitle>
                <CardDescription>Evolução do faturamento</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center space-y-2 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto" />
                  <p className="text-sm">Sem dados para exibir</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Produtos</CardTitle>
                <CardDescription>Mais vendidos do período</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center space-y-2 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto" />
                  <p className="text-sm">Sem dados para exibir</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cmv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custo de Mercadoria Vendida</CardTitle>
              <CardDescription>Análise de custos e margens</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center space-y-2 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto" />
                <p className="text-sm">Configure fichas técnicas para ver o CMV</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fechamentos de Caixa</CardTitle>
              <CardDescription>Histórico de aberturas e fechamentos</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center space-y-2 text-muted-foreground">
                <p className="text-sm">Nenhum fechamento registrado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Giro de Mesa</CardTitle>
                <CardDescription>Tempo médio de ocupação</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center space-y-2 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto" />
                  <p className="text-sm">Sem dados para exibir</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Preparo</CardTitle>
                <CardDescription>Performance da cozinha</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center space-y-2 text-muted-foreground">
                  <p className="text-sm">Sem dados para exibir</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
