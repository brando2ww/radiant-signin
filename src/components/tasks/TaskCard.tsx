import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Task } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const categoryLabels: Record<string, string> = {
  payment: "Pagamento",
  meeting: "Reunião",
  reconciliation: "Reconciliação",
  administrative: "Administrativo",
  personal: "Pessoal",
  other: "Outro",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getCardStyle = () => {
    const startHour = task.startTime.getHours();
    const startMinute = task.startTime.getMinutes();
    const endHour = task.endTime.getHours();
    const endMinute = task.endTime.getMinutes();

    const HOUR_HEIGHT = 60;
    const START_HOUR = 0;

    const top = ((startHour - START_HOUR) * HOUR_HEIGHT) + (startMinute / 60 * HOUR_HEIGHT);
    const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
    const height = duration * HOUR_HEIGHT;

    return {
      top: `${top}px`,
      height: `${Math.max(height, 40)}px`,
      numericHeight: Math.max(height, 40),
    };
  };

  const positionStyle = getCardStyle();
  const taskColor = task.color || '#6366f1';
  const isCompact = positionStyle.numericHeight < 50;
  const isMedium = positionStyle.numericHeight >= 50 && positionStyle.numericHeight < 80;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-lg border-l-4 cursor-pointer overflow-hidden",
        "transition-all hover:shadow-lg hover:z-10 shadow-sm",
        isCompact ? "p-1.5" : "p-2",
        task.status === 'completed' && "opacity-60"
      )}
      style={{
        top: positionStyle.top,
        height: positionStyle.height,
        borderLeftColor: taskColor,
        backgroundColor: `${taskColor}15`,
      }}
      onClick={onClick}
    >
      {isCompact ? (
        // Layout compacto: título e horário na mesma linha
        <div className="flex items-center justify-between h-full gap-2">
          <h4 className="text-xs font-semibold truncate text-foreground flex-1">{task.title}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(task.startTime, "HH:mm")}
          </span>
        </div>
      ) : (
        // Layout normal
        <>
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-sm font-semibold truncate pr-2 text-foreground">{task.title}</h4>
            {task.priority === 'high' || task.priority === 'urgent' ? (
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-destructive" />
            ) : task.status === 'completed' ? (
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
            ) : null}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" style={{ color: taskColor }} />
            <span>
              {format(task.startTime, "HH:mm")} - {format(task.endTime, "HH:mm")}
            </span>
          </div>

          {/* Badge de categoria só aparece se tiver espaço suficiente */}
          {!isMedium && (
            <Badge 
              variant="outline"
              className="text-xs px-1.5 py-0 mt-1.5 border"
              style={{ 
                backgroundColor: `${taskColor}20`,
                color: taskColor,
                borderColor: `${taskColor}40`
              }}
            >
              {categoryLabels[task.category] || task.category}
            </Badge>
          )}
        </>
      )}
    </div>
  );
}
