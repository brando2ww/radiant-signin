import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

export default function CashFlow() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
        <p className="text-muted-foreground mt-1">
          Visualize entradas e saídas financeiras
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">Neste mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">Neste mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">Resultado do mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Gráfico de entradas vs saídas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Gráfico de fluxo de caixa em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projeção de Saldo</CardTitle>
          <CardDescription>Baseado em contas a pagar e receber</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Saldo Atual</span>
              <span className="font-bold">R$ 0,00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-success">+ A Receber</span>
              <span className="font-medium text-success">R$ 0,00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-destructive">- A Pagar</span>
              <span className="font-medium text-destructive">R$ 0,00</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-muted/50 rounded-md px-3">
              <span className="font-semibold">Saldo Projetado</span>
              <span className="font-bold text-lg">R$ 0,00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
