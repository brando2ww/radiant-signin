import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { usePDVCostCenters } from "@/hooks/use-pdv-cost-centers";
import { usePDVFinancialTransactions } from "@/hooks/use-pdv-financial-transactions";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CostCenters() {
  const { costCenters, isLoading } = usePDVCostCenters();
  const { transactions, isLoading: isLoadingTx } = usePDVFinancialTransactions({
    transaction_type: "payable",
    status: ["paid"],
    due_date_from: startOfMonth(new Date()),
    due_date_to: endOfMonth(new Date()),
  });

  const spendByCenter = useMemo(() => {
    const map: Record<string, number> = {};
    (transactions || []).forEach((t: any) => {
      if (t.cost_center_id) {
        map[t.cost_center_id] = (map[t.cost_center_id] || 0) + Number(t.amount);
      }
    });
    return map;
  }, [transactions]);

  const totalSpend = Object.values(spendByCenter).reduce((s, v) => s + v, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centros de Custo</h1>
          <p className="text-muted-foreground mt-1">Rastreie despesas por setor ou departamento</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Centro de Custo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Total Gasto no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTx ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold text-destructive">{fmt(totalSpend)}</div>
                <p className="text-xs text-muted-foreground mt-1">despesas pagas</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sem Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTx ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold text-warning">
                  {(transactions || []).filter((t: any) => !t.cost_center_id).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">lançamentos sem classificação</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centros de Custo Cadastrados</CardTitle>
          <CardDescription>Gastos do mês por centro de custo</CardDescription>
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
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{fmt(spendByCenter[center.id] || 0)}</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
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
