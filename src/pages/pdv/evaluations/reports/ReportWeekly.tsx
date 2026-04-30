import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/pdv/DashboardMetricCard";
import { useCustomerEvaluations, useExportEvaluations, isStarsAnswer } from "@/hooks/use-customer-evaluations";
import { useEvaluationQuestionTexts, useAllTimeCustomerWhatsapps } from "@/hooks/use-evaluation-report-helpers";
import { NpsDonut } from "@/components/evaluations/reports/NpsDonut";
import { NpsPerQuestion } from "@/components/evaluations/reports/NpsPerQuestion";
import { CustomerProfile } from "@/components/evaluations/reports/CustomerProfile";
import {
  format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, Legend,
} from "recharts";
import { CalendarDays, MessageSquare, Star, TrendingUp, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-md text-sm">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs mt-0.5">
          {entry.name}: <strong>{typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function ReportWeekly() {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const prevWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const { data: currentEvals, isLoading: loadingCurrent } = useCustomerEvaluations({
    startDate: format(currentWeekStart, "yyyy-MM-dd"),
    endDate: format(currentWeekEnd, "yyyy-MM-dd"),
  });
  const { data: prevEvals, isLoading: loadingPrev } = useCustomerEvaluations({
    startDate: format(prevWeekStart, "yyyy-MM-dd"),
    endDate: format(prevWeekEnd, "yyyy-MM-dd"),
  });

  const { data: questionTexts } = useEvaluationQuestionTexts();
  const { data: allTimeWhatsapps } = useAllTimeCustomerWhatsapps();
  const exportMutation = useExportEvaluations();

  const isLoading = loadingCurrent || loadingPrev;

  const calcStats = (evals: typeof currentEvals) => {
    if (!evals || evals.length === 0) return { total: 0, avgSat: 0, nps: 0, promoters: 0, detractors: 0, neutrals: 0 };
    const total = evals.length;
    const allScores = evals.flatMap(e => e.evaluation_answers.filter(isStarsAnswer).map(a => a.score));
    const avgSat = allScores.length > 0 ? allScores.reduce((s, v) => s + v, 0) / allScores.length : 0;
    const npsScores = evals.filter(e => e.nps_score !== null).map(e => e.nps_score!);
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const neutrals = npsScores.length - promoters - detractors;
    const nps = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0;
    return { total, avgSat, nps, promoters, detractors, neutrals };
  };

  const current = useMemo(() => calcStats(currentEvals), [currentEvals]);
  const prev = useMemo(() => calcStats(prevEvals), [prevEvals]);

  const pctChange = (curr: number, prv: number) => {
    if (prv === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prv) / prv) * 100);
  };

  const weekdayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const comparisonData = useMemo(() => {
    const currentDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
    const prevDays = eachDayOfInterval({ start: prevWeekStart, end: prevWeekEnd });
    return weekdayNames.map((name, i) => {
      const currDayStr = currentDays[i] ? format(currentDays[i], "yyyy-MM-dd") : "";
      const prevDayStr = prevDays[i] ? format(prevDays[i], "yyyy-MM-dd") : "";
      return {
        dia: name,
        "Semana Atual": (currentEvals || []).filter(e => e.evaluation_date.startsWith(currDayStr)).length,
        "Semana Anterior": (prevEvals || []).filter(e => e.evaluation_date.startsWith(prevDayStr)).length,
      };
    });
  }, [currentEvals, prevEvals, currentWeekStart, prevWeekStart]);

  const evolutionData = useMemo(() => {
    const allEvals = [...(prevEvals || []), ...(currentEvals || [])];
    const days = eachDayOfInterval({ start: prevWeekStart, end: currentWeekEnd });
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayEvals = allEvals.filter(e => e.evaluation_date.startsWith(dayStr));
      const scores = dayEvals.flatMap(e => e.evaluation_answers.filter(isStarsAnswer).map(a => a.score));
      const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
      return { data: format(day, "dd/MM"), satisfação: Number(avg.toFixed(2)) };
    });
  }, [currentEvals, prevEvals, prevWeekStart, currentWeekEnd]);

  // New vs Recurring
  const { newCount, recurringCount } = useMemo(() => {
    if (!currentEvals || !allTimeWhatsapps) return { newCount: 0, recurringCount: 0 };
    let n = 0, r = 0;
    currentEvals.forEach(e => {
      const firstDate = allTimeWhatsapps.get(e.customer_whatsapp);
      if (firstDate && e.evaluation_date <= firstDate) n++;
      else r++;
    });
    return { newCount: n, recurringCount: r };
  }, [currentEvals, allTimeWhatsapps]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Semanal</h1>
          <p className="text-sm text-muted-foreground">Comparativo semanal</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const totalChange = pctChange(current.total, prev.total);
  const satChange = pctChange(current.avgSat, prev.avgSat);
  const npsChange = pctChange(current.nps, prev.nps);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Semanal</h1>
          <p className="text-sm text-muted-foreground">
            {format(currentWeekStart, "dd/MM")} — {format(currentWeekEnd, "dd/MM/yyyy")} vs semana anterior
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportMutation.mutate({ startDate: format(currentWeekStart, "yyyy-MM-dd"), endDate: format(currentWeekEnd, "yyyy-MM-dd") })}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardMetricCard title="Respostas" value={current.total} icon={MessageSquare} trend={{ value: totalChange, isPositive: totalChange >= 0 }} />
        <DashboardMetricCard title="Média Satisfação" value={current.avgSat.toFixed(1)} icon={Star} trend={{ value: satChange, isPositive: satChange >= 0 }} />
        <DashboardMetricCard title="NPS" value={current.nps} icon={TrendingUp} trend={{ value: npsChange, isPositive: npsChange >= 0 }} />
      </div>

      {/* NPS Donut + Customer Profile */}
      {current.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NpsDonut promoters={current.promoters} neutrals={current.neutrals} detractors={current.detractors} nps={current.nps} title="NPS da Semana" />
          <CustomerProfile newCount={newCount} recurringCount={recurringCount} />
        </div>
      )}

      {/* NPS per Question */}
      {current.total > 0 && currentEvals && (
        <NpsPerQuestion evaluations={currentEvals} questionTexts={questionTexts} />
      )}

      {/* Comparative bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-primary" />
            Respostas por Dia — Semana Atual vs Anterior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="dia" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Semana Atual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Semana Anterior" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Satisfaction evolution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução da Satisfação (14 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="data" fontSize={12} />
              <YAxis domain={[0, 5]} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="satisfação" name="Satisfação" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
