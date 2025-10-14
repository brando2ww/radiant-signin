import { KPICard } from '../KPICard';
import { CategoryDistributionChart } from '../CategoryDistributionChart';
import { TransactionsTable } from '../TransactionsTable';
import { TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';

interface ExpenseTabProps {
  reportData: any;
  transactions: any[];
}

export const ExpenseTab = ({ reportData, transactions }: ExpenseTabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const expenses = transactions.filter(t => t.type === 'expense');
  const { summary, expenseByCategory, comparison } = reportData;
  
  const maxExpense = expenses.length > 0
    ? Math.max(...expenses.map(t => Number(t.amount)))
    : 0;
  
  const avgExpense = expenses.length > 0
    ? summary.totalExpense / expenses.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="Maior Despesa"
          value={formatCurrency(maxExpense)}
          icon={<AlertCircle className="h-6 w-6" />}
          subtitle={`${expenses.length} transações`}
        />
        <KPICard
          title="Despesa Média"
          value={formatCurrency(avgExpense)}
          icon={<BarChart3 className="h-6 w-6" />}
          subtitle="Por transação"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart
          data={expenseByCategory}
          title="Distribuição por Categoria"
        />
        <CategoryDistributionChart
          data={expenseByCategory.slice(0, 5)}
          title="Top 5 Categorias"
        />
      </div>

      <TransactionsTable
        transactions={expenses}
        title="Detalhamento de Despesas"
        type="expense"
      />
    </div>
  );
};
