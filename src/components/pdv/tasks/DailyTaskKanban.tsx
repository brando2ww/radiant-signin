import { Badge } from "@/components/ui/badge";
import { DailyTaskCard } from "./DailyTaskCard";
import type { DailyTask, DailyTaskStatus } from "@/hooks/use-daily-tasks";

interface Props {
  tasks: DailyTask[];
  onStart: (task: DailyTask) => void;
  onViewDetails: (task: DailyTask) => void;
  onReassign: (task: DailyTask) => void;
  onSkip: (task: DailyTask) => void;
}

const COLUMNS: { status: DailyTaskStatus[]; label: string; color: string }[] = [
  { status: ["pending"], label: "Não iniciada", color: "text-muted-foreground" },
  { status: ["in_progress"], label: "Em andamento", color: "text-blue-600" },
  { status: ["done", "done_late"], label: "Concluída", color: "text-emerald-600" },
  { status: ["overdue"], label: "Atrasada", color: "text-destructive" },
];

export function DailyTaskKanban({ tasks, onStart, onViewDetails, onReassign, onSkip }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => col.status.includes(t.status));
        return (
          <div key={col.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
              <Badge variant="outline" className="text-xs">{colTasks.length}</Badge>
            </div>
            <div className="space-y-2 min-h-[100px] rounded-lg bg-muted/30 p-2">
              {colTasks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhuma</p>
              )}
              {colTasks.map(task => (
                <DailyTaskCard
                  key={task.scheduleId}
                  task={task}
                  compact
                  onStart={onStart}
                  onViewDetails={onViewDetails}
                  onReassign={onReassign}
                  onSkip={onSkip}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
