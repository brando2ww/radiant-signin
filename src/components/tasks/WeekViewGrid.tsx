import { Task } from "@/hooks/use-tasks";
import { TaskCard } from "./TaskCard";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WeekViewGridProps {
  currentWeek: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function WeekViewGrid({ currentWeek, tasks, onTaskClick, onTimeSlotClick }: WeekViewGridProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const HOUR_HEIGHT = 60;
  const isToday = (date: Date) => isSameDay(date, new Date());

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(task.startTime, day));
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time axis */}
      <div className="w-16 flex-shrink-0 border-r bg-muted/30">
        <div className="h-12 border-b" /> {/* Header spacer */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="border-b text-xs text-muted-foreground text-right pr-2 flex items-start justify-end"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {hour === 0 ? "00:00" : `${hour.toString().padStart(2, "0")}:00`}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex min-w-max">
          {days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={cn(
                "flex-1 border-r min-w-[140px]",
                isToday(day) && "bg-primary/5"
              )}
            >
              {/* Day header */}
              <div className="h-12 border-b flex flex-col items-center justify-center bg-card">
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    isToday(day) && "bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>

              {/* Hour slots */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    onClick={() => onTimeSlotClick(day, hour)}
                  />
                ))}

                {/* Task cards */}
                {getTasksForDay(day).map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
