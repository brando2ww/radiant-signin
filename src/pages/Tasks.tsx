import { useState } from "react";
import { startOfWeek, isSameWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { WeekViewHeader } from "@/components/tasks/WeekViewHeader";
import { WeekViewGrid } from "@/components/tasks/WeekViewGrid";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Task } from "@/hooks/use-tasks";
import { AppLayout } from "@/components/layouts/AppLayout";

export default function Tasks() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultHour, setDefaultHour] = useState<number | undefined>();

  const filters = {
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
    priority: priority !== "all" ? priority : undefined,
    weekStart: currentWeek,
  };

  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(filters);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDefaultDate(undefined);
    setDefaultHour(undefined);
    setDialogOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedTask(undefined);
    setDefaultDate(date);
    setDefaultHour(hour);
    setDialogOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTask({ id: selectedTask.id, ...taskData });
    } else {
      createTask(taskData);
    }
    
    // Navegar para a semana da tarefa criada/editada
    const taskWeekStart = startOfWeek(taskData.startTime, { weekStartsOn: 0 });
    if (!isSameWeek(taskWeekStart, currentWeek, { weekStartsOn: 0 })) {
      setCurrentWeek(taskWeekStart);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Button onClick={() => {
          setSelectedTask(undefined);
          setDefaultDate(new Date());
          setDefaultHour(9);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <TaskFilters
        search={search}
        category={category}
        status={status}
        priority={priority}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
      />

      <WeekViewHeader currentWeek={currentWeek} onWeekChange={setCurrentWeek} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando tarefas...</p>
          </div>
        ) : (
          <WeekViewGrid
            currentWeek={currentWeek}
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        defaultDate={defaultDate}
        defaultHour={defaultHour}
      />
    </AppLayout>
  );
}
