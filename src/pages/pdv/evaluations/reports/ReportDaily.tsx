import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/pdv/DashboardMetricCard";
import { useCustomerEvaluations, useEvaluationStats, useExportEvaluations } from "@/hooks/use-customer-evaluations";
import { useEvaluationQuestionTexts, useAllTimeCustomerWhatsapps } from "@/hooks/use-evaluation-report-helpers";
import { NpsDonut } from "@/components/evaluations/reports/NpsDonut";
import { NpsPerQuestion } from "@/components/evaluations/reports/NpsPerQuestion";
import { CustomerProfile } from "@/components/evaluations/reports/CustomerProfile";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { CalendarDays, MessageSquare, Star, TrendingDown, AlertTriangle, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2.5 shadow-md text-sm">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs mt-0.5">
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function ReportDaily() {
  const today = new Date();
  const startDate = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");

  const { data: evaluations, isLoading } = useCustomerEvaluations({ startDate, endDate });
  const stats = useEvaluationStats(startDate, endDate);
  const { data: questionTexts } = useEvaluationQuestionTexts();
  const { data: allTimeWhatsapps } = useAllTimeCustomerWhatsapps();
  const exportMutation = useExportEvaluations();

  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Hooks must be before early return
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

  const tableData = useMemo(() => {
    return (evaluations || []).map(e => {
      const avg = e.evaluation_answers.length > 0
        ? e.evaluation_answers.reduce((s, a) => s + a.score, 0) / e.evaluation_answers.length
        : 0;
      return { ...e, avgScore: avg };
    });
  }, [evaluations]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Diário</h1>
          <p className="text-sm text-muted-foreground">
            {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const totalToday = evaluations?.length || 0;

  const negativeAlerts = (evaluations || [])
    .map(e => {
      const avg = e.evaluation_answers.length > 0
        ? e.evaluation_answers.reduce((s, a) => s + a.score, 0) / e.evaluation_answers.length
        : 0;
      return { ...e, avgScore: avg };
    })
    .filter(e => e.avgScore > 0 && e.avgScore < 3);

  const hourlyMap = new Map<number, number>();
  (evaluations || []).forEach(e => {
    const hour = new Date(e.evaluation_date).getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
  });
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    respostas: hourlyMap.get(i) || 0,
  })).filter((_, i) => i >= 6 && i <= 23);

  const totalPages = Math.ceil(tableData.length / pageSize);
  const pagedData = tableData.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Diário</h1>
          <p className="text-sm text-muted-foreground">
            {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
        <DashboardMetricCard title="Respostas Hoje" value={totalToday} icon={MessageSquare} subtitle="avaliações recebidas" />
        <DashboardMetricCard title="Média Satisfação" value={stats?.avgSatisfaction?.toFixed(1) || "0.0"} icon={Star} subtitle="de 5.0" />
        <DashboardMetricCard title="NPS do Dia" value={stats?.nps || 0} icon={TrendingDown} subtitle={`${stats?.promoters || 0} promotores, ${stats?.detractors || 0} detratores`} />
        <DashboardMetricCard title="Alertas Negativos" value={negativeAlerts.length} icon={AlertTriangle} subtitle="média < 3 estrelas" />
      </div>

      {/* NPS Donut + Customer Profile */}
      {totalToday > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats && (
            <NpsDonut promoters={stats.promoters} neutrals={stats.neutrals} detractors={stats.detractors} nps={stats.nps} title="NPS do Dia" />
          )}
          <CustomerProfile newCount={newCount} recurringCount={recurringCount} />
        </div>
      )}

      {/* NPS per Question */}
      {totalToday > 0 && evaluations && (
        <NpsPerQuestion evaluations={evaluations} questionTexts={questionTexts} />
      )}

      {/* Hourly distribution */}
      {totalToday > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-primary" />
              Distribuição por Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hora" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="respostas" name="Respostas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Paginated responses table */}
      {totalToday > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-primary" />
              Respostas do Dia ({tableData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cliente</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">WhatsApp</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Média</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">NPS</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map(row => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium text-foreground">{row.customer_name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{row.customer_whatsapp}</td>
                      <td className="py-2 px-3">
                        <Badge variant={row.avgScore >= 3 ? "default" : "destructive"}>{row.avgScore.toFixed(1)} ★</Badge>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{row.nps_score ?? "—"}</td>
                      <td className="py-2 px-3 text-muted-foreground">{format(new Date(row.evaluation_date), "HH:mm")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Próxima</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Negative alerts */}
      {negativeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertas Negativos do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cliente</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">WhatsApp</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Média</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {negativeAlerts.map(alert => (
                    <tr key={alert.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium text-foreground">{alert.customer_name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{alert.customer_whatsapp}</td>
                      <td className="py-2 px-3"><Badge variant="destructive">{alert.avgScore.toFixed(1)} ★</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">{format(new Date(alert.evaluation_date), "HH:mm")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {totalToday === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma avaliação recebida hoje ainda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
