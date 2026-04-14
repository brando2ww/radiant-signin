import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChecklistDashboard } from "@/hooks/use-checklist-dashboard";

export function OperationHealthWidget() {
  const { healthPct, metrics, metricsLoading } = useChecklistDashboard();

  if (metricsLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (metrics && metrics.total === 0) {
    return null; // No checklists for today
  }

  const pct = healthPct ?? 100;
  const level = pct >= 90 ? "green" : pct >= 70 ? "yellow" : "red";

  const colors = {
    green: { bg: "bg-green-500", ring: "ring-green-200", text: "text-green-700", label: "Excelente" },
    yellow: { bg: "bg-yellow-500", ring: "ring-yellow-200", text: "text-yellow-700", label: "Atenção" },
    red: { bg: "bg-red-500", ring: "ring-red-200", text: "text-red-700", label: "Crítico" },
  };

  const c = colors[level];

  return (
    <Card>
      <CardContent className="py-4 flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center ring-4", c.bg, c.ring)}>
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Saúde da Operação</p>
          <p className={cn("text-xs", c.text)}>
            {c.label} — {pct}% concluídos ({metrics?.concluido}/{metrics?.total})
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
