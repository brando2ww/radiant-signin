import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ListChecks, CheckCircle2, Clock, AlertTriangle, RefreshCw, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DailyMetrics } from "@/hooks/use-daily-tasks";

interface Props {
  metrics: DailyMetrics;
  currentShift: string;
  hasTasks: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
}

const SHIFT_COLORS: Record<string, string> = {
  Abertura: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Tarde: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  Fechamento: "bg-violet-500/10 text-violet-600 border-violet-500/30",
};

export function DailyOverview({ metrics, currentShift, hasTasks, onGenerate, isGenerating }: Props) {
  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Date + Shift + Generate */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold leading-tight">
                {format(today, "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {format(today, "EEEE", { locale: ptBR })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`ml-2 ${SHIFT_COLORS[currentShift] || ""}`}>
            Turno atual: {currentShift}
          </Badge>
        </div>

        {hasTasks ? (
          <Button variant="outline" size="sm" onClick={onGenerate} disabled={isGenerating}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
            Regerar
          </Button>
        ) : null}
      </div>

      {/* Metrics cards */}
      {hasTasks && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={ListChecks} label="Total" value={metrics.total} color="text-primary" />
          <MetricCard icon={CheckCircle2} label="Concluídas" value={metrics.done} color="text-emerald-500" />
          <MetricCard icon={Clock} label="Em andamento" value={metrics.inProgress} color="text-blue-500" />
          <MetricCard icon={AlertTriangle} label="Atrasadas" value={metrics.overdue} color="text-destructive" />
        </div>
      )}

      {/* Progress bar */}
      {hasTasks && (
        <div className="flex items-center gap-3">
          <Progress value={metrics.progress} className="flex-1 h-2.5" />
          <Badge variant={metrics.progress === 100 ? "default" : "secondary"} className="text-xs">
            {metrics.progress}%
          </Badge>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <Icon className={`h-5 w-5 ${color} shrink-0`} />
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
