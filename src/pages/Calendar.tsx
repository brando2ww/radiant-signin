import { useState } from 'react';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import { EventsTimeline } from '@/components/calendar/EventsTimeline';
import { EventDetailsPanel } from '@/components/calendar/EventDetailsPanel';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { MonthSummary } from '@/components/calendar/MonthSummary';
import { SearchBar } from '@/components/calendar/SearchBar';
import { useCalendarEvents, CalendarEvent } from '@/hooks/use-calendar-events';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { useTasks, Task } from '@/hooks/use-tasks';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, X, Plus } from 'lucide-react';

export default function Calendar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [filters, setFilters] = useState({
    showBills: true,
    showTransactions: true,
    showCards: true,
    showTasks: true,
    status: 'all' as 'all' | 'pending' | 'paid' | 'overdue',
  });

  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  const { data: events = [], isLoading, refetch: refetchEvents } = useCalendarEvents(currentMonth, filters);
  const { tasks, createTask, updateTask, deleteTask } = useTasks({});

  // Filter events by search query
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    if (isMobile) {
      setEventDetailOpen(true);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setDefaultDate(selectedDate || new Date());
    setTaskDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    if (event.type === 'task' && event.taskId) {
      const task = tasks.find(t => t.id === event.taskId);
      if (task) {
        setSelectedTask(task);
        setDefaultDate(undefined);
        setTaskDialogOpen(true);
      }
    } else if (event.type === 'bill') {
      navigate('/contas');
      toast({
        title: "Navegar para Contas",
        description: "Você pode editar esta conta na página de Contas a Pagar/Receber.",
      });
    } else if (event.type === 'transaction') {
      navigate('/transacoes');
      toast({
        title: "Navegar para Transações",
        description: "Você pode editar esta transação na página de Transações.",
      });
    } else if (event.type === 'card_due' || event.type === 'card_closing') {
      navigate('/cartoes');
      toast({
        title: "Navegar para Cartões",
        description: "Você pode gerenciar seus cartões na página de Cartões de Crédito.",
      });
    }
    setEventDetailOpen(false);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (event.type === 'task' && event.taskId) {
      deleteTask(event.taskId);
      setSelectedEvent(null);
      setEventDetailOpen(false);
      refetchEvents();
    } else {
      toast({
        title: "Ação não disponível",
        description: "Para excluir este item, acesse a página correspondente.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = (event: CalendarEvent) => {
    if (event.type === 'task' && event.taskId) {
      updateTask({ id: event.taskId, status: 'completed' });
      setSelectedEvent(null);
      setEventDetailOpen(false);
      refetchEvents();
    } else {
      toast({
        title: "Ação não disponível",
        description: "Para marcar este item como pago, acesse a página correspondente.",
      });
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTask({ id: selectedTask.id, ...taskData });
    } else {
      createTask(taskData);
    }
    setTaskDialogOpen(false);
    setSelectedTask(undefined);
    setTimeout(() => refetchEvents(), 500);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setTaskDialogOpen(false);
    setSelectedTask(undefined);
    setSelectedEvent(null);
    setTimeout(() => refetchEvents(), 500);
  };

  return (
    <AppLayout className="p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Agenda Financeira</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Visualize e gerencie seus compromissos financeiros
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTask} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nova Tarefa</span>
              </Button>
              {/* Mobile filter button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="md:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] md:h-[350px]" />
            <Skeleton className="h-[400px] md:h-[600px]" />
          </div>
        ) : (
          <>
            {/* Mobile Layout */}
            {isMobile ? (
              <div className="space-y-4">
                {/* Mini Calendar */}
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  events={events}
                />
                
                {/* Month Summary */}
                <MonthSummary events={events} />
                
                {/* Events Timeline */}
                <div className="max-h-[50vh] overflow-y-auto">
                  <EventsTimeline
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelectEvent={handleSelectEvent}
                    selectedDate={selectedDate}
                  />
                </div>
              </div>
            ) : (
              /* Desktop Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Mini Calendar + Summary + Filters */}
                <div className="lg:col-span-3 space-y-4">
                  <MiniCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    events={events}
                  />
                  <MonthSummary events={events} />
                  <CalendarFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                </div>

                {/* Center Column - Events Timeline */}
                <div className="lg:col-span-5">
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    <EventsTimeline
                      events={filteredEvents}
                      selectedEvent={selectedEvent}
                      onSelectEvent={handleSelectEvent}
                      selectedDate={selectedDate}
                    />
                  </div>
                </div>

                {/* Right Column - Event Details */}
                <div className="lg:col-span-4">
                  <div className="sticky top-4">
                    <EventDetailsPanel 
                      event={selectedEvent}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      onMarkAsPaid={handleMarkAsPaid}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CalendarFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Event Details Sheet */}
      <Sheet open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>Detalhes do Evento</SheetTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setEventDetailOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <EventDetailsPanel 
              event={selectedEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        defaultDate={defaultDate}
        defaultHour={9}
      />
    </AppLayout>
  );
}