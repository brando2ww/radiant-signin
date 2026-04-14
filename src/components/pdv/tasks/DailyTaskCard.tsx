import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play, Eye, UserRoundCog, XCircle, AlertTriangle, Clock, CheckCircle2, Circle, Timer,
} from "lucide-react";
import type { DailyTask, DailyTaskStatus } from "@/hooks/use-daily-tasks";
import { cn } from "@/lib/utils";

interface Props {
  task: DailyTask;
  compact?: boolean;
  onStart: (task: DailyTask) => void;
  onViewDetails: (task: DailyTask) => void;
  onReassign: (task: DailyTask) => void;
  onSkip: (task: DailyTask) => void;
}

const STATUS_CONFIG: Record<DailyTaskStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "Não iniciada", color: "bg-muted text-muted-foreground", icon: Circle },
  in_progress: { label: "Em andamento", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Clock },
  done: { label: "Concluída", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
  overdue: { label: "Atrasada", color: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle },
  done_late: { label: "Concluída c/ atraso", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: Timer },
  skipped: { label: "Ignorada", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const SECTOR_COLORS: Record<string, string> = {
  cozinha: "border-l-orange-500",
  salao: "border-l-blue-500",
  caixa: "border-l-emerald-500",
  bar: "border-l-purple-500",
  estoque: "border-l-yellow-500",
  gerencia: "border-l-red-500",
};

function getTimeRemaining(task: DailyTask): string | null {
  if (task.status === "done" || task.status === "done_late" || task.status === "skipped") return null;
  const now = new Date();
  const [dh, dm] = task.deadlineTime.split(":").map(Number);
  const deadlineMin = dh * 60 + dm;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const diff = deadlineMin - nowMin;
  if (diff > 0) return `Faltam ${diff} min`;
  if (diff < 0) return `Atrasada há ${Math.abs(diff)} min`;
  return "No prazo";
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export function DailyTaskCard({ task, compact, onStart, onViewDetails, onReassign, onSkip }: Props) {
  const cfg = STATUS_CONFIG[task.status];
  const StatusIcon = cfg.icon;
  const timeStr = getTimeRemaining(task);
  const isOverdue = task.status === "overdue";

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        SECTOR_COLORS[task.sector] || "border-l-primary",
        isOverdue && "animate-pulse ring-1 ring-destructive/40",
        task.status === "skipped" && "opacity-50",
      )}
    >
      <div className={cn("p-3", compact ? "space-y-2" : "flex items-start gap-3")}>
        {/* Left: status icon */}
        <StatusIcon className={cn("h-5 w-5 shrink-0 mt-0.5", isOverdue ? "text-destructive" : "text-muted-foreground")} />

        {/* Center: info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{task.checklistName}</p>
            {task.hasCriticalItems && (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            )}
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", cfg.color)}>
              {cfg.label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="capitalize">{task.sector}</span>
            <span>{task.startTime} → {task.deadlineTime}</span>
            {task.assignedOperatorName && (
              <span className="flex items-center gap-1">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {getInitials(task.assignedOperatorName)}
                </span>
                {task.assignedOperatorName}
              </span>
            )}
            {timeStr && (
              <span className={cn("font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                {timeStr}
              </span>
            )}
          </div>

          {/* Item progress for in_progress */}
          {task.status === "in_progress" && task.totalItems > 0 && (
            <p className="text-xs text-blue-600">{task.completedItems}/{task.totalItems} itens</p>
          )}
        </div>

        {/* Right: actions */}
        {!compact && (
          <div className="flex items-center gap-1 shrink-0">
            {(task.status === "pending" || task.status === "overdue") && (
              <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => onStart(task)}>
                <Play className="h-3 w-3" /> Iniciar
              </Button>
            )}
            {task.status === "in_progress" && (
              <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => onStart(task)}>
                <Play className="h-3 w-3" /> Continuar
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onViewDetails(task)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onReassign(task)}>
              <UserRoundCog className="h-3.5 w-3.5" />
            </Button>
            {task.status !== "done" && task.status !== "done_late" && task.status !== "skipped" && (
              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => onSkip(task)}>
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
