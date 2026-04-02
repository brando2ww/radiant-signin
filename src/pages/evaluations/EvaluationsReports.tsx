import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useCustomerEvaluations, useEvaluationStats, useExportEvaluations } from "@/hooks/use-customer-evaluations";
import { format, subDays } from "date-fns";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";

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

export default function EvaluationsReports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const stats = useEvaluationStats(startDate, endDate);
  const exportEvaluations = useExportEvaluations();

  if (!stats) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground text-center py-16">Carregando relatórios...</p>
      </div>
    );
  }

  const npsPieData = [
    { name: "Promotores (9-10)", value: stats.promoters, color: COLORS.promoter },
    { name: "Neutros (7-8)", value: stats.neutrals, color: COLORS.neutral },
    { name: "Detratores (0-6)", value: stats.detractors, color: COLORS.detractor },
  ].filter(d => d.value > 0);

  const npsColor = stats.nps >= 50 ? "text-emerald-600" : stats.nps >= 0 ? "text-amber-600" : "text-destructive";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise consolidada de todas as campanhas</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportEvaluations.mutate({ startDate, endDate })}
            disabled={exportEvaluations.isPending}
            className="gap-2"
          >
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {stats.totalEvaluations === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">Nenhuma avaliação encontrada no período selecionado.</p>
      ) : (
        <>
          {/* NPS Donut */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">NPS — Net Promoter Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center min-w-[80px]">
                  <p className={`text-5xl font-bold ${npsColor}`}>{stats.nps}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.nps >= 75 ? "Excelente" : stats.nps >= 50 ? "Ótimo" : stats.nps >= 0 ? "Bom" : "Precisa melhorar"}
                  </p>
                </div>
                <div className="flex-1 w-full">
                  {npsPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={npsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                          {npsPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Sem dados de NPS</p>
                  )}
                </div>
                <div className="space-y-2 text-sm min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.promoter }} />
                    <span>Promotores: <strong>{stats.promoters}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.neutral }} />
                    <span>Neutros: <strong>{stats.neutrals}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.detractor }} />
                    <span>Detratores: <strong>{stats.detractors}</strong></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolution chart */}
          {stats.evolutionData.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolução da Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats.evolutionData}>
                    <defs>
                      <linearGradient id="satGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.promoter} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.promoter} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="avgSatisfaction" name="Satisfação" stroke={COLORS.promoter} strokeWidth={2} fill="url(#satGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Weekday + Age */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Satisfação por Dia da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.weekdayStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgScore" name="Média" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribuição por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Avaliações" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
