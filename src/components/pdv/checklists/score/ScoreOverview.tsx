import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, BarChart3, CheckCircle2, Crown, Zap } from "lucide-react";
import { RankingWithComparison, ScorePeriodType } from "@/hooks/use-operator-scores";
import { DateRange } from "react-day-picker";

interface ScoreOverviewProps {
  period: ScorePeriodType;
  onPeriodChange: (p: ScorePeriodType) => void;
  customRange: DateRange | undefined;
  onCustomRangeChange: (r: DateRange | undefined) => void;
  ranking: RankingWithComparison[];
}

export function ScoreOverview({ period, onPeriodChange, customRange, onCustomRangeChange, ranking }: ScoreOverviewProps) {
  const avgScore = ranking.length > 0
    ? Math.round(ranking.reduce((s, r) => s + r.score, 0) / ranking.length)
    : 0;

  const avgPrevScore = ranking.length > 0
    ? ranking.filter(r => r.previousScore !== null).length > 0
      ? Math.round(ranking.filter(r => r.previousScore !== null).reduce((s, r) => s + (r.previousScore || 0), 0) / ranking.filter(r => r.previousScore !== null).length)
      : null
    : null;

  const scoreChange = avgPrevScore !== null ? avgScore - avgPrevScore : null;

  const totalExecs = ranking.reduce((s, r) => s + r.totalExecutions, 0);
  const totalCompleted = ranking.reduce((s, r) => s + r.completedCount, 0);
  const completionRate = totalExecs > 0 ? Math.round((totalCompleted / totalExecs) * 100) : 0;

  const topScorer = ranking.length > 0 ? ranking[0] : null;

  const mostImproved = ranking.length > 0
    ? ranking.filter(r => r.scoreChange !== null && r.scoreChange > 0).sort((a, b) => (b.scoreChange || 0) - (a.scoreChange || 0))[0] || null
    : null;

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={period} onValueChange={(v) => onPeriodChange(v as ScorePeriodType)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana Atual</SelectItem>
            <SelectItem value="last_week">Semana Passada</SelectItem>
            <SelectItem value="month">Mês Atual</SelectItem>
            <SelectItem value="last_month">Mês Passado</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        {period === "custom" && (
          <DatePickerWithRange date={customRange} setDate={onCustomRangeChange} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Score Médio</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{avgScore}</span>
                  {scoreChange !== null && (
                    <span className={`flex items-center text-xs font-medium ${scoreChange > 0 ? "text-green-600" : scoreChange < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {scoreChange > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : scoreChange < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
                      {scoreChange > 0 ? "+" : ""}{scoreChange} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                <span className="text-2xl font-bold">{completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Maior Score</p>
                {topScorer ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]" style={{ backgroundColor: topScorer.avatarColor || "hsl(var(--muted))" }}>
                        {getInitials(topScorer.operatorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{topScorer.operatorName}</p>
                      <p className="text-xs text-muted-foreground">{topScorer.score} pts</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Mais Melhorou</p>
                {mostImproved ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]" style={{ backgroundColor: mostImproved.avatarColor || "hsl(var(--muted))" }}>
                        {getInitials(mostImproved.operatorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{mostImproved.operatorName}</p>
                      <p className="text-xs text-green-600">+{mostImproved.scoreChange} pts</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
