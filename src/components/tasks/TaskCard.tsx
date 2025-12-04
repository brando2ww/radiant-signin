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
    };
  };

  const positionStyle = getCardStyle();
  const taskColor = task.color || '#6366f1';

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-lg p-2.5 border-l-4 cursor-pointer",
        "transition-all hover:shadow-lg hover:z-10 shadow-sm",
        task.status === 'completed' && "opacity-60"
      )}
      style={{
        ...positionStyle,
        borderLeftColor: taskColor,
        backgroundColor: `${taskColor}15`,
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-sm font-semibold truncate pr-2 text-foreground">{task.title}</h4>
        {task.priority === 'high' || task.priority === 'urgent' ? (
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-destructive" />
        ) : task.status === 'completed' ? (
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
        ) : null}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
        <Clock className="h-3 w-3" style={{ color: taskColor }} />
        <span>
          {format(task.startTime, "HH:mm")} - {format(task.endTime, "HH:mm")}
        </span>
      </div>

      {task.location && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{task.location}</span>
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {task.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0 h-4">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <Badge 
        variant="outline"
        className="text-xs px-1.5 py-0.5 mt-1.5 border"
        style={{ 
          backgroundColor: `${taskColor}20`,
          color: taskColor,
          borderColor: `${taskColor}40`
        }}
      >
        {categoryLabels[task.category] || task.category}
      </Badge>
    </div>
  );
}
