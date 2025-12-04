import { useState } from "react";
import { startOfWeek, isSameWeek, addDays, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { WeekViewHeader } from "@/components/tasks/WeekViewHeader";
import { WeekViewGrid } from "@/components/tasks/WeekViewGrid";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Task } from "@/hooks/use-tasks";
import { AppLayout } from "@/components/layouts/AppLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileDayView } from "@/components/tasks/MobileDayView";

export default function Tasks() {
  const isMobile = useIsMobile();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [mobileSelectedDay, setMobileSelectedDay] = useState(new Date());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultHour, setDefaultHour] = useState<number | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    
    const taskWeekStart = startOfWeek(taskData.startTime, { weekStartsOn: 0 });
    if (!isSameWeek(taskWeekStart, currentWeek, { weekStartsOn: 0 })) {
      setCurrentWeek(taskWeekStart);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setDialogOpen(false);
  };

  const handleMobilePrevDay = () => {
    setMobileSelectedDay(subDays(mobileSelectedDay, 1));
  };

  const handleMobileNextDay = () => {
    setMobileSelectedDay(addDays(mobileSelectedDay, 1));
  };

  const handleMobileToday = () => {
    setMobileSelectedDay(new Date());
  };

  const activeFiltersCount = [
    search,
    category !== "all" ? category : null,
    status !== "all" ? status : null,
    priority !== "all" ? priority : null,
  ].filter(Boolean).length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <h1 className="text-xl md:text-2xl font-bold">Tarefas</h1>
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden relative">
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <TaskFilters
                  search={search}
                  category={category}
                  status={status}
                  priority={priority}
                  onSearchChange={setSearch}
                  onCategoryChange={setCategory}
                  onStatusChange={setStatus}
                  onPriorityChange={setPriority}
                  vertical
                />
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            size="sm"
            onClick={() => {
              setSelectedTask(undefined);
              setDefaultDate(isMobile ? mobileSelectedDay : new Date());
              setDefaultHour(9);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Nova Tarefa</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
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
      </div>

      {/* Mobile Day Navigation */}
      {isMobile && (
        <div className="flex items-center justify-between p-3 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={handleMobilePrevDay}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="font-semibold">
              {format(mobileSelectedDay, "EEEE", { locale: ptBR })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(mobileSelectedDay, "d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleMobileToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={handleMobileNextDay}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Week Header */}
      {!isMobile && (
        <WeekViewHeader currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando tarefas...</p>
          </div>
        ) : isMobile ? (
          <MobileDayView
            selectedDay={mobileSelectedDay}
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
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
