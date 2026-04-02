import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { useCustomerEvaluations, useEvaluationStats } from "@/hooks/use-customer-evaluations";
import { Users, TrendingUp, Star, Megaphone, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function EvaluationsDashboard() {
  const { data: campaigns, isLoading: loadingCampaigns } = useEvaluationCampaigns();
  const { data: evaluations, isLoading: loadingEvals } = useCustomerEvaluations();
  const stats = useEvaluationStats();

  const isLoading = loadingCampaigns || loadingEvals;

  // KPIs
  const totalResponses = campaigns?.reduce((sum, c) => sum + c.total_responses, 0) || 0;
  const activeCampaigns = campaigns?.filter(c => c.is_active).length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const nps = stats?.nps ?? 0;
  const avgSatisfaction = stats?.avgSatisfaction ?? 0;

  const npsColor = nps >= 50 ? "text-emerald-600" : nps >= 0 ? "text-amber-600" : "text-destructive";

  // Responses per day (last 30 days)
  const dailyMap = new Map<string, number>();
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    dailyMap.set(d, 0);
  }
  evaluations?.forEach(e => {
    const d = e.evaluation_date?.split("T")[0] || e.created_at?.split("T")[0];
    if (d && dailyMap.has(d)) {
      dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
    }
  });
  const dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({
    day: format(parseISO(date), "dd/MM", { locale: ptBR }),
    respostas: count,
  }));

  // Top campaigns
  const topCampaigns = [...(campaigns || [])]
    .sort((a, b) => b.total_responses - a.total_responses)
    .slice(0, 5);

  // Negative alerts (NPS ≤ 6 in last 24h)
  const yesterday = subDays(new Date(), 1);
  const negativeAlerts = (evaluations || []).filter(e => {
    const evalDate = new Date(e.evaluation_date || e.created_at);
    return evalDate >= yesterday && e.nps_score !== null && e.nps_score <= 6;
  }).slice(0, 5);

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral de todas as suas campanhas de avaliação</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total de Respostas</span>
            </div>
            <p className="text-2xl font-bold">{totalResponses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">NPS Global</span>
            </div>
            <p className={`text-2xl font-bold ${npsColor}`}>{nps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Média Geral</span>
            </div>
            <p className="text-2xl font-bold">{avgSatisfaction.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Campanhas Ativas</span>
            </div>
            <p className="text-2xl font-bold">{activeCampaigns} <span className="text-sm font-normal text-muted-foreground">/ {totalCampaigns}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Respostas nos últimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.some(d => d.respostas > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="respostas"
                  name="Respostas"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#evalGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhuma resposta nos últimos 30 dias</p>
          )}
        </CardContent>
      </Card>

      {/* Bottom grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top campaigns */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length > 0 ? (
              <div className="space-y-3">
                {topCampaigns.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                      <span className="text-sm font-medium truncate max-w-[200px]">{c.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{c.total_responses} respostas</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma campanha criada</p>
            )}
          </CardContent>
        </Card>

        {/* Negative alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Alertas Negativos (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {negativeAlerts.length > 0 ? (
              <div className="space-y-3">
                {negativeAlerts.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{e.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{e.customer_whatsapp}</p>
                    </div>
                    <span className="text-destructive font-bold">NPS {e.nps_score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum alerta negativo nas últimas 24h 🎉
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
