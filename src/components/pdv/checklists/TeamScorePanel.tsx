import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trophy, Medal, Award, Star } from "lucide-react";
import { useOperatorRanking, useScoreHistory } from "@/hooks/use-operator-scores";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function TeamScorePanel() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const { data: ranking, isLoading } = useOperatorRanking(period);
  const { data: history } = useScoreHistory(selectedOp);

  const positionIcons = [
    <Trophy key="1" className="h-5 w-5 text-yellow-500" />,
    <Medal key="2" className="h-5 w-5 text-gray-400" />,
    <Award key="3" className="h-5 w-5 text-amber-600" />,
  ];

  const chartData = (history || []).map((h: any) => ({
    period: h.period_start?.slice(5, 10),
    score: h.score,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Score da Equipe</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana Atual</SelectItem>
            <SelectItem value="month">Mês Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !ranking?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhum dado de score disponível.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {ranking.map((r, i) => (
            <Card
              key={r.operatorId}
              className={`cursor-pointer transition-colors ${selectedOp === r.operatorId ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedOp(selectedOp === r.operatorId ? null : r.operatorId)}
            >
              <CardContent className="py-3 flex items-center gap-3">
                <div className="w-8 text-center font-bold text-lg text-muted-foreground">
                  {i < 3 ? positionIcons[i] : `${i + 1}º`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.operatorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={r.score} className="h-2 flex-1" />
                    <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{r.score}/100</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <span>{r.totalExecutions} execuções</span>
                    <span>•</span>
                    <span>{r.onTimeCount} no prazo</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {r.badges.map((b) => (
                    <Badge key={b} variant="secondary" className="text-[10px] whitespace-nowrap">
                      <Star className="h-3 w-3 mr-1" />{b}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOp && chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Histórico de Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
