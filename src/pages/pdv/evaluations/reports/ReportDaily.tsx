import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetricCard } from "@/components/pdv/DashboardMetricCard";
import { useCustomerEvaluations, useEvaluationStats } from "@/hooks/use-customer-evaluations";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { CalendarDays, MessageSquare, Star, TrendingDown, AlertTriangle } from "lucide-react";
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

  // Negative alerts (avg score < 3)
  const negativeAlerts = (evaluations || [])
    .map(e => {
      const avg = e.evaluation_answers.length > 0
        ? e.evaluation_answers.reduce((s, a) => s + a.score, 0) / e.evaluation_answers.length
        : 0;
      return { ...e, avgScore: avg };
    })
    .filter(e => e.avgScore > 0 && e.avgScore < 3);

  // Hourly distribution
  const hourlyMap = new Map<number, number>();
  (evaluations || []).forEach(e => {
    const hour = new Date(e.evaluation_date).getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
  });
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    respostas: hourlyMap.get(i) || 0,
  })).filter((_, i) => i >= 6 && i <= 23); // show 6h-23h

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatório Diário</h1>
        <p className="text-sm text-muted-foreground">
          {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Respostas Hoje"
          value={totalToday}
          icon={MessageSquare}
          subtitle="avaliações recebidas"
        />
        <DashboardMetricCard
          title="Média Satisfação"
          value={stats?.avgSatisfaction?.toFixed(1) || "0.0"}
          icon={Star}
          subtitle="de 5.0"
        />
        <DashboardMetricCard
          title="NPS do Dia"
          value={stats?.nps || 0}
          icon={TrendingDown}
          subtitle={`${stats?.promoters || 0} promotores, ${stats?.detractors || 0} detratores`}
        />
        <DashboardMetricCard
          title="Alertas Negativos"
          value={negativeAlerts.length}
          icon={AlertTriangle}
          subtitle="média < 3 estrelas"
        />
      </div>

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

      {/* Negative alerts table */}
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
                      <td className="py-2 px-3">
                        <Badge variant="destructive">{alert.avgScore.toFixed(1)} ★</Badge>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {format(new Date(alert.evaluation_date), "HH:mm")}
                      </td>
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
