import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/pdv/DashboardMetricCard";
import {
  useCustomerEvaluations, useEvaluationStats, useExportEvaluations,
} from "@/hooks/use-customer-evaluations";
import { useEvaluationQuestionTexts, useAllTimeCustomerWhatsapps } from "@/hooks/use-evaluation-report-helpers";
import { NpsDonut } from "@/components/evaluations/reports/NpsDonut";
import { NpsPerQuestion } from "@/components/evaluations/reports/NpsPerQuestion";
import { CustomerProfile } from "@/components/evaluations/reports/CustomerProfile";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell,
} from "recharts";
import {
  MessageSquare, Star, TrendingUp, Download, Users, Gift,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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

export default function ReportMonthly() {
  const today = new Date();
  const startDate = format(startOfMonth(today), "yyyy-MM-dd");
  const endDate = format(endOfMonth(today), "yyyy-MM-dd");

  const { data: evaluations, isLoading } = useCustomerEvaluations({ startDate, endDate });
  const stats = useEvaluationStats(startDate, endDate);
  const exportMutation = useExportEvaluations();
  const { data: questionTexts } = useEvaluationQuestionTexts();
  const { data: allTimeWhatsapps } = useAllTimeCustomerWhatsapps();

  // New vs Recurring
  const { newCount, recurringCount } = useMemo(() => {
    if (!evaluations || !allTimeWhatsapps) return { newCount: 0, recurringCount: 0 };
    let n = 0, r = 0;
    evaluations.forEach(e => {
      const firstDate = allTimeWhatsapps.get(e.customer_whatsapp);
      if (firstDate && e.evaluation_date <= firstDate) n++;
      else r++;
    });
    return { newCount: n, recurringCount: r };
  }, [evaluations, allTimeWhatsapps]);

  // Birthdays this month
  const birthdays = useMemo(() => {
    if (!evaluations) return [];
    const currentMonth = today.getMonth();
    const seen = new Set<string>();
    return evaluations
      .filter(e => {
        if (!e.customer_birth_date) return false;
        const bMonth = new Date(e.customer_birth_date).getMonth();
        if (bMonth !== currentMonth) return false;
        if (seen.has(e.customer_whatsapp)) return false;
        seen.add(e.customer_whatsapp);
        return true;
      })
      .map(e => ({
        name: e.customer_name,
        whatsapp: e.customer_whatsapp,
        birthDate: e.customer_birth_date,
      }))
      .sort((a, b) => new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate());
  }, [evaluations, today]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Mensal</h1>
          <p className="text-sm text-muted-foreground">{format(today, "MMMM yyyy", { locale: ptBR })}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const total = evaluations?.length || 0;
  const promotersPct = stats && (stats.promoters + stats.detractors + stats.neutrals) > 0
    ? Math.round((stats.promoters / (stats.promoters + stats.detractors + stats.neutrals)) * 100)
    : 0;

  const allScores = (evaluations || []).flatMap(e => e.evaluation_answers.map(a => a.score));
  const scoreDistribution = [1, 2, 3, 4, 5].map(score => ({
    nota: `${score} ★`,
    quantidade: allScores.filter(s => s === score).length,
  }));
  const scoreColors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Mensal</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {format(today, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportMutation.mutate({ startDate, endDate })}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard title="Total Respostas" value={total} icon={MessageSquare} subtitle="no mês" />
        <DashboardMetricCard title="Média Satisfação" value={stats?.avgSatisfaction?.toFixed(1) || "0.0"} icon={Star} subtitle="de 5.0" />
        <DashboardMetricCard title="NPS" value={stats?.nps || 0} icon={TrendingUp} subtitle={stats?.nps !== undefined ? (stats.nps >= 50 ? "Excelente" : stats.nps >= 0 ? "Bom" : "Precisa melhorar") : "—"} />
        <DashboardMetricCard title="Promotores" value={`${promotersPct}%`} icon={Users} subtitle={`${stats?.promoters || 0} de ${(stats?.promoters || 0) + (stats?.neutrals || 0) + (stats?.detractors || 0)}`} />
      </div>

      {/* NPS Donut + Customer Profile */}
      {total > 0 && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NpsDonut promoters={stats.promoters} neutrals={stats.neutrals} detractors={stats.detractors} nps={stats.nps} />
          <CustomerProfile newCount={newCount} recurringCount={recurringCount} />
        </div>
      )}

      {/* NPS per Question */}
      {total > 0 && evaluations && (
        <NpsPerQuestion evaluations={evaluations} questionTexts={questionTexts} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="nota" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" name="Quantidade" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((_, i) => <Cell key={i} fill={scoreColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekday satisfaction */}
        {stats?.weekdayStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Satisfação por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.weekdayStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" fontSize={11} />
                  <YAxis domain={[0, 5]} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgScore" name="Média" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Age distribution */}
      {stats?.ageDistribution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="ageGroup" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Clientes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Birthdays */}
      {birthdays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-5 w-5 text-primary" />
              Aniversariantes do Mês ({birthdays.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cliente</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">WhatsApp</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {birthdays.map((b, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium text-foreground">{b.name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{b.whatsapp}</td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary">{format(new Date(b.birthDate), "dd/MM")}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {total === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma avaliação recebida neste mês ainda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
