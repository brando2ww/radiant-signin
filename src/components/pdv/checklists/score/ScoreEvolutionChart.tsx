import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { useScoreHistory, RankingWithComparison } from "@/hooks/use-operator-scores";

const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#a855f7"];

interface ScoreEvolutionChartProps {
  ranking: RankingWithComparison[];
}

export function ScoreEvolutionChart({ ranking }: ScoreEvolutionChartProps) {
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [goal, setGoal] = useState(80);

  const allIds = ranking.map(r => r.operatorId);
  const queryIds = selectedOps.length > 0 ? selectedOps : allIds;
  const { data: history } = useScoreHistory(queryIds);

  const toggleOp = (id: string) => {
    setSelectedOps(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Build chart data: group by period, one key per operator + team average
  const periodMap = new Map<string, Record<string, number>>();
  (history || []).forEach((h: any) => {
    const key = h.period_start?.slice(0, 10) || "";
    if (!periodMap.has(key)) periodMap.set(key, {});
    const entry = periodMap.get(key)!;
    const opName = ranking.find(r => r.operatorId === h.operator_id)?.operatorName || h.operator_id;
    entry[opName] = h.score;
  });

  const chartData = Array.from(periodMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, scores]) => {
      const values = Object.values(scores);
      const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      return { period: period.slice(5, 10), ...scores, "Média Equipe": avg };
    });

  const displayOps = selectedOps.length > 0
    ? ranking.filter(r => selectedOps.includes(r.operatorId))
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Evolução do Score</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Meta:</span>
            <Input
              type="number"
              value={goal}
              onChange={e => setGoal(Number(e.target.value))}
              className="w-16 h-7 text-xs"
              min={0}
              max={100}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ranking.slice(0, 8).map(r => (
            <Badge
              key={r.operatorId}
              variant={selectedOps.includes(r.operatorId) ? "default" : "outline"}
              className="cursor-pointer text-[11px]"
              onClick={() => toggleOp(r.operatorId)}
            >
              {r.operatorName}
            </Badge>
          ))}
        </div>

        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Dados de histórico aparecerão aqui conforme scores forem registrados
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={goal} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: `Meta ${goal}`, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Line type="monotone" dataKey="Média Equipe" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              {displayOps.map((op, i) => (
                <Line
                  key={op.operatorId}
                  type="monotone"
                  dataKey={op.operatorName}
                  stroke={COLORS[(i + 1) % COLORS.length]}
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  strokeDasharray={i % 2 === 0 ? undefined : "4 2"}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
