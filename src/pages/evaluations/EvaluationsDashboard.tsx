import { useState, useMemo } from "react";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { useCustomerEvaluations, useEvaluationStats, useExportEvaluations, EvaluationWithAnswers } from "@/hooks/use-customer-evaluations";
import { useEvaluationQuestionTexts } from "@/hooks/use-evaluation-report-helpers";
import { useDashboardCoupons, useBirthdayCount } from "@/hooks/use-dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardKPICards from "@/components/evaluations/dashboard/DashboardKPICards";
import { FunnelChart, WeeklyResponsesChart } from "@/components/evaluations/dashboard/DashboardCharts";
import NPSCriteriaSection from "@/components/evaluations/dashboard/NPSCriteriaSection";
import RecentResponsesTable from "@/components/evaluations/dashboard/RecentResponsesTable";

export default function EvaluationsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const { data: campaigns, isLoading: loadingCampaigns } = useEvaluationCampaigns();
  const { data: evaluations, isLoading: loadingEvals } = useCustomerEvaluations({ startDate, endDate });
  const stats = useEvaluationStats(startDate, endDate);
  const { data: questionTexts } = useEvaluationQuestionTexts();
  const { data: couponData } = useDashboardCoupons(startDate, endDate);
  const exportCSV = useExportEvaluations();

  const isLoading = loadingCampaigns || loadingEvals;

  // Quick date presets
  const setPreset = (days: number | "month") => {
    if (days === "month") {
      setDateRange({ from: startOfMonth(new Date()), to: new Date() });
    } else {
      setDateRange({ from: subDays(new Date(), days), to: new Date() });
    }
  };

  // Derived data
  const totalResponses = stats?.totalEvaluations || 0;
  const activeCampaigns = campaigns?.filter(c => c.is_active).length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const nps = stats?.nps ?? 0;
  const avgSatisfaction = stats?.avgSatisfaction ?? 0;
  const promoters = stats?.promoters ?? 0;
  const neutrals = stats?.neutrals ?? 0;
  const detractors = stats?.detractors ?? 0;
  const totalNpsVotes = promoters + neutrals + detractors;

  const birthdayCount = useBirthdayCount(evaluations);

  const uniqueCustomers = useMemo(() => {
    if (!evaluations) return 0;
    return new Set(evaluations.map(e => e.customer_whatsapp)).size;
  }, [evaluations]);

  // Weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      const label = format(d, "EEE dd/MM", { locale: ptBR });
      const count = evaluations?.filter(e => (e.evaluation_date || e.created_at).startsWith(key)).length || 0;
      days.push({ day: label, count });
    }
    return days;
  }, [evaluations]);

  // NPS criteria per question
  const criteriaStats = useMemo(() => {
    if (!evaluations || !questionTexts) return [];

    const map = new Map<string, { scores: number[] }>();
    evaluations.forEach(e => {
      e.evaluation_answers.forEach(a => {
        if (!map.has(a.question_id)) map.set(a.question_id, { scores: [] });
        map.get(a.question_id)!.scores.push(a.score);
      });
    });

    return Array.from(map.entries()).map(([qId, { scores }]) => {
      // For 1-5 scale: 5=promoter, 4=neutral, 1-3=detractor
      const promoters = scores.filter(s => s >= 5).length;
      const neutrals = scores.filter(s => s === 4).length;
      const detractors = scores.filter(s => s <= 3).length;
      const total = scores.length;
      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
      return {
        questionId: qId,
        questionText: questionTexts.get(qId) || "Pergunta desconhecida",
        nps,
        promoters,
        neutrals,
        detractors,
        total,
      };
    }).sort((a, b) => b.nps - a.nps);
  }, [evaluations, questionTexts]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header + date filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral de todas as suas campanhas de avaliação</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreset(7)}>7 dias</Button>
          <Button variant="outline" size="sm" onClick={() => setPreset(30)}>30 dias</Button>
          <Button variant="outline" size="sm" onClick={() => setPreset("month")}>Mês atual</Button>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardKPICards
        totalResponses={totalResponses}
        nps={nps}
        avgSatisfaction={avgSatisfaction}
        activeCampaigns={activeCampaigns}
        totalCampaigns={totalCampaigns}
        promoters={promoters}
        neutrals={neutrals}
        detractors={detractors}
        totalNpsVotes={totalNpsVotes}
        birthdayCount={birthdayCount}
        uniqueCustomers={uniqueCustomers}
        totalCoupons={couponData?.totalCoupons || 0}
        redeemedCoupons={couponData?.redeemedCoupons || 0}
      />

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        <FunnelChart data={{
          respostas: totalResponses,
          cadastros: uniqueCustomers,
          cuponsGerados: couponData?.totalCoupons || 0,
          cuponsUsados: couponData?.redeemedCoupons || 0,
        }} />
        <WeeklyResponsesChart data={weeklyData} />
      </div>

      {/* NPS Criteria */}
      <NPSCriteriaSection criteria={criteriaStats} />

      {/* Recent responses */}
      <RecentResponsesTable
        evaluations={evaluations || []}
        onExportCSV={() => exportCSV.mutate({ startDate, endDate })}
      />
    </div>
  );
}
