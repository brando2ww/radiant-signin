import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RankingWithComparison } from "@/hooks/use-operator-scores";

interface ScorePodiumProps {
  ranking: RankingWithComparison[];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function TrendBadge({ change }: { change: number | null }) {
  if (change === null) return null;
  if (change > 0) return <span className="flex items-center text-xs font-medium text-green-600"><TrendingUp className="h-3 w-3 mr-0.5" />+{change}</span>;
  if (change < 0) return <span className="flex items-center text-xs font-medium text-red-500"><TrendingDown className="h-3 w-3 mr-0.5" />{change}</span>;
  return <span className="flex items-center text-xs text-muted-foreground"><Minus className="h-3 w-3 mr-0.5" />0</span>;
}

function EmptySlot({ position }: { position: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">
        {position}º
      </div>
      <p className="text-xs text-muted-foreground">—</p>
    </div>
  );
}

export function ScorePodium({ ranking }: ScorePodiumProps) {
  const hasData = ranking.some(r => r.score > 0);
  const top3 = ranking.slice(0, 3);

  const icons = [
    <Trophy key="t" className="h-6 w-6 text-yellow-500" />,
    <Medal key="m" className="h-5 w-5 text-gray-400" />,
    <Award key="a" className="h-5 w-5 text-amber-700" />,
  ];

  const heights = ["h-40", "h-32", "h-28"];
  const order = [1, 0, 2]; // display order: 2nd | 1st | 3rd

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-end justify-center gap-6">
            <EmptySlot position={2} />
            <div className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-2xl font-bold">
                1º
              </div>
              <p className="text-xs text-muted-foreground">—</p>
            </div>
            <EmptySlot position={3} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            O pódio será preenchido assim que a equipe executar os primeiros checklists
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex items-end justify-center gap-4 md:gap-8">
          {order.map((idx) => {
            const r = top3[idx];
            if (!r) return <EmptySlot key={idx} position={idx + 1} />;
            const isFirst = idx === 0;
            return (
              <div key={r.operatorId} className={`flex flex-col items-center gap-2 ${isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                <div className="relative">
                  {icons[idx]}
                </div>
                <Avatar className={isFirst ? "h-20 w-20" : "h-14 w-14"}>
                  <AvatarFallback
                    className={`${isFirst ? "text-xl" : "text-sm"} font-bold text-white`}
                    style={{ backgroundColor: r.avatarColor || "hsl(var(--primary))" }}
                  >
                    {getInitials(r.operatorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className={`font-semibold ${isFirst ? "text-base" : "text-sm"}`}>{r.operatorName}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                  <p className={`font-bold ${isFirst ? "text-2xl" : "text-lg"}`}>{r.score}</p>
                  <TrendBadge change={r.scoreChange} />
                </div>
                <div className={`w-20 ${heights[idx]} rounded-t-lg ${isFirst ? "bg-yellow-500/20" : idx === 1 ? "bg-gray-300/20" : "bg-amber-700/20"}`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
