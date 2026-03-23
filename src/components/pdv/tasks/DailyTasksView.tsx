import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { TaskInstance, ShiftConfig } from "@/hooks/use-operational-tasks";
import { format } from "date-fns";

interface Props {
  instances: TaskInstance[];
  shifts: ShiftConfig[];
  isLoading: boolean;
}

export function DailyTasksView({ instances, shifts, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Nenhuma tarefa gerada para hoje.</p>
          <p className="text-sm mt-1">Clique em "Gerar Tarefas do Dia" para criar as tarefas a partir dos templates.</p>
        </CardContent>
      </Card>
    );
  }

  const totalDone = instances.filter((i) => i.status === "done").length;
  const progress = Math.round((totalDone / instances.length) * 100);

  const grouped = shifts.map((shift) => ({
    shift,
    tasks: instances.filter((i) => i.shift === shift.name.toLowerCase() || i.shift === shift.name),
  })).filter((g) => g.tasks.length > 0);

  // Include ungrouped tasks
  const groupedShiftNames = shifts.map((s) => s.name.toLowerCase());
  const ungrouped = instances.filter(
    (i) => !groupedShiftNames.includes(i.shift.toLowerCase()) && !shifts.some((s) => s.name === i.shift)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{format(new Date(), "dd/MM/yyyy")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{totalDone}/{instances.length} concluídas</span>
          <Progress value={progress} className="w-32 h-2" />
          <Badge variant={progress === 100 ? "default" : "secondary"}>{progress}%</Badge>
        </div>
      </div>

      {grouped.map(({ shift, tasks }) => {
        const done = tasks.filter((t) => t.status === "done").length;
        return (
          <Card key={shift.name}>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {shift.name}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({shift.start} - {shift.end})
                  </span>
                </CardTitle>
                <Badge variant="outline" className="text-xs">{done}/{tasks.length} ✓</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {ungrouped.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">Outros</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="space-y-2">
              {ungrouped.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: TaskInstance }) {
  const isDone = task.status === "done";
  return (
    <div className={`flex items-center gap-3 p-2 rounded-md ${isDone ? "bg-primary/5" : "bg-muted/30"}`}>
      {isDone ? (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
        )}
      </div>
      {task.assignedTo && (
        <span className="text-xs text-muted-foreground shrink-0">{task.assignedTo}</span>
      )}
      {isDone && task.completedAt && (
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(task.completedAt), "HH:mm")}
        </span>
      )}
      {isDone && task.completedBy && (
        <Badge variant="outline" className="text-xs shrink-0">{task.completedBy}</Badge>
      )}
      {task.photoUrl && <Camera className="h-4 w-4 text-primary shrink-0" />}
    </div>
  );
}
