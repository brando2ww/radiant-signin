import { Task } from "@/hooks/use-tasks";
import { TaskCard } from "./TaskCard";
import { isSameDay } from "date-fns";

interface MobileDayViewProps {
  selectedDay: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function MobileDayView({ 
  selectedDay, 
  tasks, 
  onTaskClick, 
  onTimeSlotClick 
}: MobileDayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const HOUR_HEIGHT = 60;

  const getTasksForDay = () => {
    return tasks.filter((task) => isSameDay(task.startTime, selectedDay));
  };

  const dayTasks = getTasksForDay();

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time axis */}
      <div className="w-14 flex-shrink-0 border-r bg-muted/30">
        {hours.map((hour) => (
          <div
            key={hour}
            className="border-b text-xs text-muted-foreground text-right pr-2 flex items-start justify-end pt-1"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {hour === 0 ? "00:00" : `${hour.toString().padStart(2, "0")}:00`}
          </div>
        ))}
      </div>

      {/* Day content */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-full">
          {/* Hour slots */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
              style={{ height: `${HOUR_HEIGHT}px` }}
              onClick={() => onTimeSlotClick(selectedDay, hour)}
            />
          ))}

          {/* Task cards */}
          {dayTasks.map((task) => (
            <TaskCard 
              key={task.id}
              task={task} 
              onClick={() => onTaskClick(task)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
