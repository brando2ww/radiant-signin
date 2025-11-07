import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductCMV() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CMV por Produto</h1>
        <p className="text-muted-foreground mt-1">
          Análise detalhada de custos e margens por produto
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Produtos Analisados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">com receitas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground mt-1">dos produtos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Melhor Margem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">0%</div>
            <p className="text-xs text-muted-foreground mt-1">produto mais lucrativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pior Margem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">0%</div>
            <p className="text-xs text-muted-foreground mt-1">requer atenção</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Produtos</CardTitle>
          <CardDescription>Custos, preços e margens por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <PackageSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum produto com receita cadastrada</p>
            <p className="text-sm mt-2">Configure receitas em Produtos → Editar Produto → Aba Receita</p>
            <p className="text-sm">para visualizar análise de CMV</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classificação de Produtos</CardTitle>
          <CardDescription>Por margem de contribuição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-success">Ótima</Badge>
                <span className="text-sm">Margem acima de 70%</span>
              </div>
              <span className="font-bold">0 produtos</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-primary">Boa</Badge>
                <span className="text-sm">Margem entre 50% e 70%</span>
              </div>
              <span className="font-bold">0 produtos</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-warning">Regular</Badge>
                <span className="text-sm">Margem entre 30% e 50%</span>
              </div>
              <span className="font-bold">0 produtos</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="destructive">Baixa</Badge>
                <span className="text-sm">Margem abaixo de 30%</span>
              </div>
              <span className="font-bold">0 produtos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
