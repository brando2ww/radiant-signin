import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, Download } from "lucide-react";

export default function DRE() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DRE - Demonstração do Resultado</h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada do resultado do exercício
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar DRE
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demonstrativo de Resultado</CardTitle>
          <CardDescription>Período: Mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Receita Bruta */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold text-lg border-b pb-2">
                <span>RECEITA BRUTA</span>
                <span className="text-success">R$ 0,00</span>
              </div>
              <div className="pl-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendas no PDV</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendas Delivery</span>
                  <span>R$ 0,00</span>
                </div>
              </div>
            </div>

            {/* Deduções */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold border-b pb-2">
                <span>(-) DEDUÇÕES</span>
                <span className="text-destructive">R$ 0,00</span>
              </div>
              <div className="pl-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Descontos concedidos</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelamentos</span>
                  <span>R$ 0,00</span>
                </div>
              </div>
            </div>

            {/* Receita Líquida */}
            <div className="flex justify-between items-center font-bold text-lg bg-muted/50 p-3 rounded">
              <span>= RECEITA LÍQUIDA</span>
              <span>R$ 0,00</span>
            </div>

            {/* CMV */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold border-b pb-2">
                <span>(-) CMV (Custo das Mercadorias Vendidas)</span>
                <span className="text-destructive">R$ 0,00</span>
              </div>
            </div>

            {/* Lucro Bruto */}
            <div className="flex justify-between items-center font-bold text-lg bg-success/10 p-3 rounded">
              <span>= LUCRO BRUTO</span>
              <span className="text-success">R$ 0,00</span>
            </div>

            {/* Despesas Operacionais */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold border-b pb-2">
                <span>(-) DESPESAS OPERACIONAIS</span>
                <span className="text-destructive">R$ 0,00</span>
              </div>
              <div className="pl-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salários e encargos</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aluguel</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilities (água, luz, gás)</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketing</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outras despesas</span>
                  <span>R$ 0,00</span>
                </div>
              </div>
            </div>

            {/* Lucro Operacional */}
            <div className="flex justify-between items-center font-bold text-lg bg-muted/50 p-3 rounded">
              <span>= LUCRO OPERACIONAL</span>
              <span>R$ 0,00</span>
            </div>

            {/* Despesas Financeiras */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold border-b pb-2">
                <span>(-) DESPESAS FINANCEIRAS</span>
                <span className="text-destructive">R$ 0,00</span>
              </div>
              <div className="pl-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Juros e taxas</span>
                  <span>R$ 0,00</span>
                </div>
              </div>
            </div>

            {/* Lucro Líquido */}
            <div className="flex justify-between items-center font-bold text-xl bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
              <span>= LUCRO LÍQUIDO</span>
              <span className="text-primary">R$ 0,00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Margens</CardTitle>
          <CardDescription>Indicadores de rentabilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Margem Bruta</p>
              <p className="text-2xl font-bold">0%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Margem Operacional</p>
              <p className="text-2xl font-bold">0%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Margem Líquida</p>
              <p className="text-2xl font-bold">0%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
