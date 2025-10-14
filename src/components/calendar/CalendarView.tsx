import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/hooks/use-calendar-events';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayContentProps } from 'react-day-picker';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  events: CalendarEvent[];
}

export const CalendarView = ({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
  events,
}: CalendarViewProps) => {
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const renderDay = (props: DayContentProps) => {
    const dayEvents = getEventsForDay(props.date);
    const hasEvents = dayEvents.length > 0;
    const hasOverdue = dayEvents.some((e) => e.status === 'overdue');

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{props.date.getDate()}</span>
        {hasEvents && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {hasOverdue && (
              <div className="w-1 h-1 rounded-full bg-destructive" />
            )}
            {dayEvents.some((e) => e.status === 'pending') && (
              <div className="w-1 h-1 rounded-full bg-warning" />
            )}
            {dayEvents.some((e) => e.status === 'paid') && (
              <div className="w-1 h-1 rounded-full bg-success" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        month={currentMonth}
        onMonthChange={onMonthChange}
        locale={ptBR}
        components={{
          DayContent: renderDay,
        }}
        className="rounded-md border"
      />

      <div className="mt-4 pt-4 border-t space-y-2">
        <h4 className="text-sm font-medium">Legenda</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Atrasado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Pago</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
