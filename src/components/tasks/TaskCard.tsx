import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Task } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const categoryColors = {
  payment: "bg-orange-100 border-orange-300 text-orange-900",
  meeting: "bg-blue-100 border-blue-300 text-blue-900",
  reconciliation: "bg-green-100 border-green-300 text-green-900",
  administrative: "bg-blue-100 border-blue-300 text-blue-900",
  personal: "bg-purple-100 border-purple-300 text-purple-900",
  other: "bg-gray-100 border-gray-300 text-gray-900",
};

const categoryLabels = {
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

  const style = getCardStyle();

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-md p-2 border-l-4 cursor-pointer transition-all hover:shadow-md hover:z-10",
        categoryColors[task.category],
        task.status === 'completed' && "opacity-60"
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-sm font-medium truncate pr-2">{task.title}</h4>
        {task.priority === 'high' || task.priority === 'urgent' ? (
          <AlertCircle className="h-3 w-3 flex-shrink-0 text-destructive" />
        ) : task.status === 'completed' ? (
          <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
        ) : null}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <Clock className="h-3 w-3" />
        <span>
          {format(task.startTime, "HH:mm")} - {format(task.endTime, "HH:mm")}
        </span>
      </div>

      {task.location && (
        <div className="flex items-center gap-1 text-xs mb-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{task.location}</span>
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {task.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs px-1 py-0 h-4">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-1">
        {categoryLabels[task.category]}
      </div>
    </div>
  );
}
