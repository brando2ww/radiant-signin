import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';
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

  if (isLoading) {
    return (
      <AppLayout className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Aqui está um resumo das suas finanças em tempo real
          </p>
        </div>

        {/* KPIs Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
          <StatsCard
            title="Receitas"
            value={formatCurrency(stats.totalRevenue)}
            icon={<TrendingUp className="h-6 w-6" />}
            delay={0}
          />
          <StatsCard
            title="Despesas"
            value={formatCurrency(stats.totalExpenses)}
            icon={<TrendingDown className="h-6 w-6" />}
            delay={100}
          />
          <StatsCard
            title="Lucro"
            value={formatCurrency(stats.profit)}
            icon={<DollarSign className="h-6 w-6" />}
            delay={200}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3 mb-4 md:mb-6">
          {/* Cash Flow Chart - Spans 2 columns */}
          <CashFlowChart data={cashFlowData} />
          
          {/* Upcoming Bills */}
          <UpcomingBills bills={upcomingBills} />
        </div>

        {/* Second Row */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* Quick Actions */}
          <QuickActions />
          
          {/* MEI Widget */}
          <MEIWidget
            dasValue={meiInfo.dasValue}
            dasMonth={meiInfo.dasMonth}
            dueDate={meiInfo.dueDate}
            yearlyRevenue={meiInfo.yearlyRevenue}
            yearlyLimit={meiInfo.yearlyLimit}
          />
          
          {/* Monthly Goals */}
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
