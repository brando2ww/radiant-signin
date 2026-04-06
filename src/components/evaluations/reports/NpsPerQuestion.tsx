import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { EvaluationWithAnswers } from "@/hooks/use-customer-evaluations";
import { useMemo } from "react";

interface Props {
  evaluations: EvaluationWithAnswers[];
  questionTexts?: Map<string, string>;
}

export function NpsPerQuestion({ evaluations, questionTexts }: Props) {
  const data = useMemo(() => {
    const questionMap = new Map<string, number[]>();
    evaluations.forEach(e => {
      e.evaluation_answers.forEach(a => {
        if (!questionMap.has(a.question_id)) questionMap.set(a.question_id, []);
        questionMap.get(a.question_id)!.push(a.score);
      });
    });

    return Array.from(questionMap.entries()).map(([qId, scores], i) => {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      const promoters = scores.filter(s => s >= 4).length;
      const detractors = scores.filter(s => s <= 2).length;
      const nps = Math.round(((promoters - detractors) / scores.length) * 100);
      const label = questionTexts?.get(qId) || `Pergunta ${i + 1}`;
      const shortLabel = label.length > 30 ? label.substring(0, 30) + "…" : label;
      return { question: shortLabel, fullQuestion: label, média: Number(avg.toFixed(2)), nps, total: scores.length };
    });
  }, [evaluations, questionTexts]);

  if (data.length === 0) return null;

  const getColor = (avg: number) => {
    if (avg >= 4) return "#22c55e";
    if (avg >= 3) return "#eab308";
    return "#ef4444";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">NPS por Pergunta</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
            <XAxis type="number" domain={[0, 5]} fontSize={12} />
            <YAxis type="category" dataKey="question" width={160} fontSize={11} tick={{ fill: "hsl(var(--foreground))" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2.5 shadow-md text-sm">
                    <p className="font-medium text-foreground mb-1">{d.fullQuestion}</p>
                    <p className="text-xs">Média: <strong>{d.média}</strong></p>
                    <p className="text-xs">NPS: <strong>{d.nps}</strong></p>
                    <p className="text-xs text-muted-foreground">{d.total} respostas</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="média" name="Média" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => <Cell key={i} fill={getColor(d.média)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
