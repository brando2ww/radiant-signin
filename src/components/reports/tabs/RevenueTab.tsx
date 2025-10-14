import { KPICard } from '../KPICard';
import { CategoryDistributionChart } from '../CategoryDistributionChart';
import { TransactionsTable } from '../TransactionsTable';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface RevenueTabProps {
  reportData: any;
  transactions: any[];
}

export const RevenueTab = ({ reportData, transactions }: RevenueTabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const revenues = transactions.filter(t => t.type === 'income');
  const { summary, revenueByCategory, comparison } = reportData;
  
  const maxRevenue = revenues.length > 0
    ? Math.max(...revenues.map(t => Number(t.amount)))
    : 0;
  
  const avgRevenue = revenues.length > 0
    ? summary.totalRevenue / revenues.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="Maior Receita"
          value={formatCurrency(maxRevenue)}
          icon={<BarChart3 className="h-6 w-6" />}
          subtitle={`${revenues.length} transações`}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(summary.averageTicket)}
          icon={<DollarSign className="h-6 w-6" />}
          subtitle="Por transação"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart
          data={revenueByCategory}
          title="Distribuição por Categoria"
        />
        <CategoryDistributionChart
          data={revenueByCategory.slice(0, 5)}
          title="Top 5 Categorias"
        />
      </div>

      <TransactionsTable
        transactions={revenues}
        title="Detalhamento de Receitas"
        type="income"
      />
    </div>
  );
};
