import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignResponses, useCampaignQuestions } from "@/hooks/use-evaluation-campaigns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, Users, TrendingUp, Award } from "lucide-react";

interface Props {
  campaignId: string;
}

const COLORS = {
  promoter: "#22c55e",
  neutral: "#eab308",
  detractor: "#ef4444",
  primary: "hsl(var(--primary))",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
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

export function CampaignReports({ campaignId }: Props) {
  const { data: responses, isLoading: loadingResponses } = useCampaignResponses(campaignId);
  const { data: questions } = useCampaignQuestions(campaignId);

  if (loadingResponses) {
    return <p className="text-sm text-muted-foreground">Carregando relatórios...</p>;
  }

  if (!responses || responses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma resposta recebida ainda. Os relatórios serão exibidos quando houver dados.
      </p>
    );
  }

  // --- NPS Calculation ---
  const npsResponses = responses.filter((r) => r.nps_score !== null && r.nps_score !== undefined);
  const promoters = npsResponses.filter((r) => (r.nps_score as number) >= 9).length;
  const neutrals = npsResponses.filter((r) => (r.nps_score as number) >= 7 && (r.nps_score as number) <= 8).length;
  const detractors = npsResponses.filter((r) => (r.nps_score as number) <= 6).length;
  const npsTotal = npsResponses.length;
  const npsScore = npsTotal > 0 ? Math.round(((promoters - detractors) / npsTotal) * 100) : 0;

  const npsColor = npsScore >= 50 ? "text-emerald-600" : npsScore >= 0 ? "text-amber-600" : "text-destructive";
  const npsLabel = npsScore >= 75 ? "Excelente" : npsScore >= 50 ? "Ótimo" : npsScore >= 0 ? "Bom" : "Precisa melhorar";

  const npsPieData = [
    { name: "Promotores (9-10)", value: promoters, color: COLORS.promoter },
    { name: "Neutros (7-8)", value: neutrals, color: COLORS.neutral },
    { name: "Detratores (0-6)", value: detractors, color: COLORS.detractor },
  ].filter((d) => d.value > 0);

  // --- General average ---
  const allScores = responses.flatMap((r) =>
    (r.evaluation_answers as any[]).map((a: any) => a.score)
  );
  const avgGeneral = allScores.length > 0
    ? (allScores.reduce((s, v) => s + v, 0) / allScores.length)
    : 0;

  const promoterRate = npsTotal > 0 ? Math.round((promoters / npsTotal) * 100) : 0;

  // --- Average per question ---
  const avgPerQuestion = (questions || []).map((q) => {
    const scores: number[] = [];
    responses.forEach((r) => {
      const answers = r.evaluation_answers as any[];
      if (!answers) return;
      const ans = answers.find((a: any) => a.question_id === q.id);
      if (ans) scores.push(ans.score);
    });
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return {
      name: q.question_text.length > 35 ? q.question_text.slice(0, 35) + "…" : q.question_text,
      media: parseFloat(avg.toFixed(1)),
      fill: avg >= 4 ? COLORS.promoter : avg >= 3 ? COLORS.neutral : COLORS.detractor,
    };
  });

  // --- Score distribution ---
  const scoreDist = [1, 2, 3, 4, 5].map((star) => ({
    name: `${star} ★`,
    count: allScores.filter((s) => s === star).length,
    fill: star >= 4 ? COLORS.promoter : star === 3 ? COLORS.neutral : COLORS.detractor,
  }));

  // --- Responses per day ---
  const responsesPerDay: Record<string, number> = {};
  responses.forEach((r) => {
    const day = format(parseISO(r.created_at), "dd/MM", { locale: ptBR });
    responsesPerDay[day] = (responsesPerDay[day] || 0) + 1;
  });
  const dailyData = Object.entries(responsesPerDay)
    .slice(-14)
    .map(([day, count]) => ({ day, respostas: count }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total respostas</span>
            </div>
            <p className="text-2xl font-bold">{responses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Média geral</span>
            </div>
            <p className="text-2xl font-bold">{avgGeneral.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">NPS Score</span>
            </div>
            <p className={`text-2xl font-bold ${npsColor}`}>{npsScore}</p>
            <p className="text-xs text-muted-foreground">{npsLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Promotores</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{promoterRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* NPS Donut */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">NPS — Net Promoter Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center min-w-[80px]">
              <p className={`text-5xl font-bold ${npsColor}`}>{npsScore}</p>
              <p className="text-sm text-muted-foreground mt-1">{npsLabel}</p>
            </div>
            <div className="flex-1 w-full">
              {npsPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={npsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      label={({ name, value }) => `${value}`}
                    >
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
                <span>Promotores: <strong>{promoters}</strong> ({npsTotal ? Math.round((promoters / npsTotal) * 100) : 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.neutral }} />
                <span>Neutros: <strong>{neutrals}</strong> ({npsTotal ? Math.round((neutrals / npsTotal) * 100) : 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.detractor }} />
                <span>Detratores: <strong>{detractors}</strong> ({npsTotal ? Math.round((detractors / npsTotal) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribuição de Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDist}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Avaliações" radius={[4, 4, 0, 0]}>
                {scoreDist.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average per question */}
      {avgPerQuestion.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Média por Pergunta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={avgPerQuestion.length * 50 + 40}>
              <BarChart data={avgPerQuestion} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tickCount={6} />
                <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="media" name="Média" radius={[0, 4, 4, 0]}>
                  {avgPerQuestion.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Responses per day */}
      {dailyData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Respostas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.promoter} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.promoter} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="respostas"
                  name="Respostas"
                  stroke={COLORS.promoter}
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                  dot={{ r: 3, fill: COLORS.promoter }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
