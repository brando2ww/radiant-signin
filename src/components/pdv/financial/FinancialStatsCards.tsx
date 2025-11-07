import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertTriangle, Wallet, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FinancialStats } from "@/hooks/use-pdv-financial-transactions";

interface FinancialStatsCardsProps {
  stats: FinancialStats;
}

export function FinancialStatsCards({ stats }: FinancialStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(stats.totalPayable)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingPayableCount} {stats.pendingPayableCount === 1 ? 'conta' : 'contas'} pendente{stats.pendingPayableCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(stats.totalReceivable)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingReceivableCount} {stats.pendingReceivableCount === 1 ? 'conta' : 'contas'} pendente{stats.pendingReceivableCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(stats.totalOverdue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.overdueCount} {stats.overdueCount === 1 ? 'conta' : 'contas'} em atraso
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
          <Wallet className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.expectedBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(stats.expectedBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.expectedBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          <Calendar className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pago:</span>
              <span className="text-sm font-medium text-destructive">{formatCurrency(stats.paidThisMonth)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Recebido:</span>
              <span className="text-sm font-medium text-success">{formatCurrency(stats.receivedThisMonth)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
