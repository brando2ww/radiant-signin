import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignResponses, useCampaignQuestions } from "@/hooks/use-evaluation-campaigns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  campaignId: string;
}

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

  const npsColor = npsScore >= 50 ? "text-green-600" : npsScore >= 0 ? "text-yellow-600" : "text-destructive";
  const npsLabel = npsScore >= 75 ? "Excelente" : npsScore >= 50 ? "Ótimo" : npsScore >= 0 ? "Bom" : "Precisa melhorar";

  const npsPieData = [
    { name: "Promotores (9-10)", value: promoters, color: "hsl(var(--chart-2))" },
    { name: "Neutros (7-8)", value: neutrals, color: "hsl(var(--chart-4))" },
    { name: "Detratores (0-6)", value: detractors, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

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
      name: q.question_text.length > 30 ? q.question_text.slice(0, 30) + "…" : q.question_text,
      media: parseFloat(avg.toFixed(1)),
    };
  });

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
      {/* NPS Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">NPS — Net Promoter Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center">
              <p className={`text-5xl font-bold ${npsColor}`}>{npsScore}</p>
              <p className="text-sm text-muted-foreground mt-1">{npsLabel}</p>
            </div>
            <div className="flex-1 w-full">
              {npsPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={npsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                      {npsPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Sem dados de NPS</p>
              )}
            </div>
            <div className="space-y-1 text-sm min-w-[140px]">
              <p>🟢 Promotores: <strong>{promoters}</strong> ({npsTotal ? Math.round((promoters / npsTotal) * 100) : 0}%)</p>
              <p>🟡 Neutros: <strong>{neutrals}</strong> ({npsTotal ? Math.round((neutrals / npsTotal) * 100) : 0}%)</p>
              <p>🔴 Detratores: <strong>{detractors}</strong> ({npsTotal ? Math.round((detractors / npsTotal) * 100) : 0}%)</p>
              <p className="text-muted-foreground mt-2">Total: {npsTotal} respostas</p>
            </div>
          </div>
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
              <BarChart data={avgPerQuestion} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" domain={[0, 5]} tickCount={6} />
                <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="media" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="respostas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
