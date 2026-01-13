import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillStatsProps {
  totalPayable: number;
  totalReceivable: number;
  overdue: number;
  type: "payable" | "receivable";
}

export function BillStats({ totalPayable, totalReceivable, overdue, type }: BillStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {type === "payable" ? "Total a Pagar" : "Total a Receber"}
          </CardTitle>
          {type === "payable" ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            type === "payable" ? "text-red-500" : "text-green-500"
          )}>
            {formatCurrency(type === "payable" ? totalPayable : totalReceivable)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{overdue}</div>
          <p className="text-xs text-muted-foreground">contas em atraso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            totalReceivable - totalPayable >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {formatCurrency(totalReceivable - totalPayable)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
