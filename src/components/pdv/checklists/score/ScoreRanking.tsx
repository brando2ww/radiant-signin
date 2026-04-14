import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { RankingWithComparison } from "@/hooks/use-operator-scores";

interface ScoreRankingProps {
  ranking: RankingWithComparison[];
  onSelectOperator?: (id: string) => void;
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export function ScoreRanking({ ranking, onSelectOperator }: ScoreRankingProps) {
  const [sectorFilter, setSectorFilter] = useState("all");

  const sectors = [...new Set(ranking.map(r => r.sector))];
  const filtered = sectorFilter === "all" ? ranking : ranking.filter(r => r.sector === sectorFilter);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Ranking Completo</CardTitle>
          {sectors.length > 1 && (
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos setores</SelectItem>
                {sectors.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum colaborador encontrado</p>
        ) : (
          filtered.map((r, i) => (
            <div
              key={r.operatorId}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelectOperator?.(r.operatorId)}
            >
              <span className="w-7 text-center font-bold text-sm text-muted-foreground">{i + 1}º</span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-bold text-white" style={{ backgroundColor: r.avatarColor || "hsl(var(--primary))" }}>
                  {getInitials(r.operatorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{r.operatorName}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{r.sector}</Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                  <span>{r.completionRate}% no prazo</span>
                  <span>•</span>
                  <span>{r.completedCount}/{r.totalExecutions} concluídos</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.badges.slice(0, 2).map(b => (
                  <Badge key={b} variant="secondary" className="text-[10px] whitespace-nowrap hidden sm:flex">
                    <Star className="h-3 w-3 mr-0.5" />{b}
                  </Badge>
                ))}
              </div>
              <div className="text-right min-w-[60px]">
                <p className="font-bold text-sm">{r.score}</p>
                {r.scoreChange !== null && (
                  <span className={`flex items-center justify-end text-[11px] font-medium ${r.scoreChange > 0 ? "text-green-600" : r.scoreChange < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {r.scoreChange > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : r.scoreChange < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
                    {r.scoreChange > 0 ? "+" : ""}{r.scoreChange}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
