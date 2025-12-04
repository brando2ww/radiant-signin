import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MEIWidget } from '@/components/dashboard/MEIWidget';
import { MonthlyGoals } from '@/components/dashboard/MonthlyGoals';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { CreditCardsOverview } from '@/components/dashboard/CreditCardsOverview';
import { RevenueByCategoryChart } from '@/components/dashboard/RevenueByCategoryChart';
import { AppLayout } from '@/components/layouts/AppLayout';

const Dashboard = () => {
  const { profile } = useAuth();
  const {
    stats,
    cashFlowData,
    upcomingBills,
    creditCards,
    monthlyGoals,
    alerts,
    revenueByCategory,
    meiInfo,
    isLoading,
  } = useDashboardData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Mock recent transactions from bills and revenue data
  const recentTransactions = [
    ...upcomingBills.slice(0, 3).map(bill => ({
      id: bill.id,
      title: bill.title,
      amount: bill.amount,
      date: bill.dueDate instanceof Date ? bill.dueDate.toISOString() : String(bill.dueDate),
      type: bill.type === 'receivable' ? 'income' as const : 'expense' as const,
      category: bill.category,
    })),
  ];

  if (isLoading) {
    return (
      <AppLayout className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-yellow-50/30 via-background to-background">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div 
          className="mb-6 md:mb-8"
          style={{ 
            animation: 'fade-slide-in 0.5s ease-out forwards',
            opacity: 0 
          }}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Aqui está um resumo das suas finanças
          </p>
        </div>

        {/* Balance Card - Full width hero */}
        <div className="mb-6">
          <BalanceCard balance={stats.profit} />
        </div>

        {/* KPIs Cards */}
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <StatsCard
            title="Receitas"
            value={formatCurrency(stats.totalRevenue)}
            icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6" />}
            variant="revenue"
            delay={100}
          />
          <StatsCard
            title="Despesas"
            value={formatCurrency(stats.totalExpenses)}
            icon={<TrendingDown className="h-5 w-5 md:h-6 md:w-6" />}
            variant="expense"
            delay={200}
          />
          <StatsCard
            title="Lucro"
            value={formatCurrency(stats.profit)}
            icon={<DollarSign className="h-5 w-5 md:h-6 md:w-6" />}
            variant="profit"
            delay={300}
          />
        </div>

        {/* Upcoming Bills - Horizontal cards */}
        <div className="mb-6">
          <UpcomingBills bills={upcomingBills} />
        </div>

        {/* Two column layout: Recent Transactions + Chart */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
          <RecentTransactions transactions={recentTransactions} />
          <CashFlowChart data={cashFlowData} />
        </div>

        {/* Second Row - Actions and Widgets */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
          <QuickActions />
          <MEIWidget
            dasValue={meiInfo.dasValue}
            dasMonth={meiInfo.dasMonth}
            dueDate={meiInfo.dueDate}
            yearlyRevenue={meiInfo.yearlyRevenue}
            yearlyLimit={meiInfo.yearlyLimit}
          />
          <MonthlyGoals
            revenueGoal={monthlyGoals.revenueGoal}
            currentRevenue={monthlyGoals.currentRevenue}
            savingsGoal={monthlyGoals.savingsGoal}
            currentSavings={monthlyGoals.currentSavings}
            investmentGoal={monthlyGoals.investmentGoal}
            currentInvestment={monthlyGoals.currentInvestment}
          />
        </div>

        {/* Alerts Widget */}
        <div className="mb-6">
          <AlertsWidget alerts={alerts} />
        </div>

        {/* Credit Cards Overview */}
        <div className="mb-6">
          <CreditCardsOverview cards={creditCards} />
        </div>

        {/* Revenue by Category Chart */}
        <div className="mb-6">
          <RevenueByCategoryChart data={revenueByCategory} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
