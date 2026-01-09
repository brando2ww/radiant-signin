import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, Building2, Target, BarChart3, Calendar, CheckSquare, Settings, Eye } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ShortcutCard } from '@/components/dashboard/ShortcutCard';
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
  const {
    profile
  } = useAuth();
  const {
    stats,
    cashFlowData,
    upcomingBills,
    creditCards,
    monthlyGoals,
    alerts,
    revenueByCategory,
    meiInfo,
    isLoading
  } = useDashboardData();
  const isMobile = useIsMobile();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };
  if (isLoading) {
    return <AppLayout className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>;
  }
  return <AppLayout className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header Simplificado */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu painel financeiro
          </p>
        </div>

        {/* Cards Principais - Layout Mobile vs Desktop */}
        {isMobile ? (
          /* Mobile: Card único de saldo com lucro em destaque */
          <Card className="bg-card border shadow-sm">
            <CardContent className="pt-6 pb-8 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
                Saldo Disponível
              </p>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className={`text-4xl font-bold ${stats.profit >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                  {formatCurrency(stats.profit)}
                </span>
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span>{formatCurrency(stats.totalExpenses)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Desktop: Dois cards lado a lado */
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Card Receitas - Verde */}
            <Card className="bg-green-500/10 border-green-500/20 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-base lg:text-lg font-semibold">Receitas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Total do Mês</p>
                  <div className="font-bold text-2xl lg:text-3xl text-green-600">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-16" />
                <Separator className="block sm:hidden w-full" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Lucro</p>
                  <div className={`font-bold text-2xl lg:text-3xl ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.profit)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Despesas - Amarelo */}
            <Card className="bg-yellow-500/10 border-yellow-500/20 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <TrendingDown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-base lg:text-lg font-semibold">Despesas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Total do Mês</p>
                  <div className="font-bold text-2xl lg:text-3xl text-foreground">
                    {formatCurrency(stats.totalExpenses)}
                  </div>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-16" />
                <Separator className="block sm:hidden w-full" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                  <div className={`font-bold text-2xl lg:text-3xl ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.balance)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Atalhos Rápidos - Estilo App Bancário */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Atalhos Rápidos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ShortcutCard title="Cartões" description="Gerenciar" icon={CreditCard} iconColor="text-yellow-600" href="/credit-cards" />
            <ShortcutCard title="Extrato" description="Movimentações" icon={Receipt} iconColor="text-yellow-600" href="/transactions" />
            <ShortcutCard title="Contas" description="Bancárias" icon={Building2} iconColor="text-yellow-600" href="/bank-accounts" />
            <ShortcutCard title="Metas" description="Objetivos" icon={Target} iconColor="text-yellow-600" href="/goals" />
            <ShortcutCard title="Relatórios" description="Análises" icon={BarChart3} iconColor="text-yellow-600" href="/reports" />
            <ShortcutCard title="Calendário" description="Agenda" icon={Calendar} iconColor="text-yellow-600" href="/calendar" />
            <ShortcutCard title="Tarefas" description="Pendências" icon={CheckSquare} iconColor="text-yellow-600" href="/tasks" />
            <ShortcutCard title="Configurações" description="Preferências" icon={Settings} iconColor="text-yellow-600" href="/settings" />
          </div>
        </div>

        {/* Visão Geral */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Visão Geral</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
            <CashFlowChart data={cashFlowData} />
            <UpcomingBills bills={upcomingBills} />
          </div>
        </div>

        {/* Resumo */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Resumo</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickActions />
            <MEIWidget dasValue={meiInfo.dasValue} dasMonth={meiInfo.dasMonth} dueDate={meiInfo.dueDate} yearlyRevenue={meiInfo.yearlyRevenue} yearlyLimit={meiInfo.yearlyLimit} />
            <MonthlyGoals revenueGoal={monthlyGoals.revenueGoal} currentRevenue={monthlyGoals.currentRevenue} savingsGoal={monthlyGoals.savingsGoal} currentSavings={monthlyGoals.currentSavings} investmentGoal={monthlyGoals.investmentGoal} currentInvestment={monthlyGoals.currentInvestment} />
          </div>
        </div>

        {/* Alertas */}
        <AlertsWidget alerts={alerts} />

        {/* Cartões de Crédito */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Cartões de Crédito</h2>
          <CreditCardsOverview cards={creditCards} />
        </div>

        {/* Receitas por Categoria */}
        
      </div>
    </AppLayout>;
};
export default Dashboard;