import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/pdv/DashboardMetricCard";
import {
  useCustomerEvaluations, useEvaluationStats, useExportEvaluations,
} from "@/hooks/use-customer-evaluations";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  CalendarDays, MessageSquare, Star, TrendingUp, Download, Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = {
  promoter: "#22c55e",
  neutral: "#eab308",
  detractor: "#ef4444",
};

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

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportMonthly() {
  const today = new Date();
  const startDate = format(startOfMonth(today), "yyyy-MM-dd");
  const endDate = format(endOfMonth(today), "yyyy-MM-dd");

  const { data: evaluations, isLoading } = useCustomerEvaluations({ startDate, endDate });
  const stats = useEvaluationStats(startDate, endDate);
  const exportMutation = useExportEvaluations();

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

  // NPS Donut
  const npsPieData = stats ? [
    { name: "Promotores (9-10)", value: stats.promoters, color: COLORS.promoter },
    { name: "Neutros (7-8)", value: stats.neutrals, color: COLORS.neutral },
    { name: "Detratores (0-6)", value: stats.detractors, color: COLORS.detractor },
  ].filter(d => d.value > 0) : [];

  // Score distribution (1-5 stars)
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
        <DashboardMetricCard
          title="Total Respostas"
          value={total}
          icon={MessageSquare}
          subtitle="no mês"
        />
        <DashboardMetricCard
          title="Média Satisfação"
          value={stats?.avgSatisfaction?.toFixed(1) || "0.0"}
          icon={Star}
          subtitle="de 5.0"
        />
        <DashboardMetricCard
          title="NPS"
          value={stats?.nps || 0}
          icon={TrendingUp}
          subtitle={stats?.nps !== undefined ? (stats.nps >= 50 ? "Excelente" : stats.nps >= 0 ? "Bom" : "Precisa melhorar") : "—"}
        />
        <DashboardMetricCard
          title="Promotores"
          value={`${promotersPct}%`}
          icon={Users}
          subtitle={`${stats?.promoters || 0} de ${(stats?.promoters || 0) + (stats?.neutrals || 0) + (stats?.detractors || 0)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Donut */}
        {npsPieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição NPS</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={npsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {npsPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

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
                  {scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={scoreColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

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
