import { useState } from 'react';
import { SessionNavBar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportHeader } from '@/components/reports/ReportHeader';
import { OverviewTab } from '@/components/reports/tabs/OverviewTab';
import { RevenueTab } from '@/components/reports/tabs/RevenueTab';
import { ExpenseTab } from '@/components/reports/tabs/ExpenseTab';
import { MEITab } from '@/components/reports/tabs/MEITab';
import { DRETab } from '@/components/reports/tabs/DRETab';
import { useReports, PeriodFilter } from '@/hooks/use-reports';
import { useMEILimits } from '@/hooks/use-mei-limits';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Reports() {
  const [period, setPeriod] = useState<PeriodFilter>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    label: 'Este Mês',
  });
  const [compareEnabled, setCompareEnabled] = useState(false);

  const { reportData, transactions, isLoading } = useReports(period, compareEnabled);
  const { meiData, isLoading: isMEILoading } = useMEILimits();

  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-8 ml-12">
        <div className="max-w-7xl mx-auto">
          <ReportHeader
            period={period}
            onPeriodChange={setPeriod}
            compareEnabled={compareEnabled}
            onCompareToggle={setCompareEnabled}
          />

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-96" />
            </div>
          ) : reportData ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="revenue">Receitas</TabsTrigger>
                <TabsTrigger value="expense">Despesas</TabsTrigger>
                <TabsTrigger value="mei">MEI</TabsTrigger>
                <TabsTrigger value="dre">DRE</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab reportData={reportData} />
              </TabsContent>

              <TabsContent value="revenue">
                <RevenueTab reportData={reportData} transactions={transactions} />
              </TabsContent>

              <TabsContent value="expense">
                <ExpenseTab reportData={reportData} transactions={transactions} />
              </TabsContent>

              <TabsContent value="mei">
                {isMEILoading ? (
                  <Skeleton className="h-96" />
                ) : (
                  <MEITab meiData={meiData} />
                )}
              </TabsContent>

              <TabsContent value="dre">
                <DRETab reportData={reportData} />
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </main>
    </div>
  );
}
