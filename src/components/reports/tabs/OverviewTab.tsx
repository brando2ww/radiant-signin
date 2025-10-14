import { KPICard } from '../KPICard';
import { TrendChart } from '../TrendChart';
import { CategoryDistributionChart } from '../CategoryDistributionChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OverviewTabProps {
  reportData: any;
}

export const OverviewTab = ({ reportData }: OverviewTabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const { summary, revenueByCategory, expenseByCategory, monthlyData, topTransactions, comparison } = reportData;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Total"
          value={formatCurrency(summary.totalRevenue)}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="success"
          change={comparison ? {
            value: comparison.revenue.change,
            isPositive: comparison.revenue.change >= 0,
          } : undefined}
        />
        <KPICard
          title="Despesa Total"
          value={formatCurrency(summary.totalExpense)}
          icon={<TrendingDown className="h-6 w-6" />}
          variant="danger"
          change={comparison ? {
            value: comparison.expense.change,
            isPositive: comparison.expense.change < 0,
          } : undefined}
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(summary.profit)}
          icon={<DollarSign className="h-6 w-6" />}
          variant={summary.profit >= 0 ? 'success' : 'danger'}
          change={comparison ? {
            value: comparison.profit.change,
            isPositive: comparison.profit.change >= 0,
          } : undefined}
        />
        <KPICard
          title="Margem de Lucro"
          value={`${summary.profitMargin.toFixed(1)}%`}
          icon={<Activity className="h-6 w-6" />}
          subtitle={`${summary.transactionCount} transações`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={monthlyData} title="Evolução Mensal" />
        <CategoryDistributionChart
          data={revenueByCategory}
          title="Receitas por Categoria"
        />
      </div>

      {/* Top Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTransactions.revenues.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">
                      {format(new Date(t.transaction_date), 'dd/MM', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{t.description || t.category}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(Number(t.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTransactions.expenses.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">
                      {format(new Date(t.transaction_date), 'dd/MM', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{t.description || t.category}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(Number(t.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
