import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ptBR } from 'date-fns/locale';
import { DayContentProps } from 'react-day-picker';
import { CalendarEvent } from '@/hooks/use-calendar-events';
import { isSameDay } from 'date-fns';

interface MiniCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  events?: CalendarEvent[];
}

export const MiniCalendar = ({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
  events = [],
}: MiniCalendarProps) => {
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  const renderDay = (props: DayContentProps) => {
    const dayEvents = getEventsForDay(props.date);
    const hasOverdue = dayEvents.some((e) => e.status === 'overdue');
    const hasPending = dayEvents.some((e) => e.status === 'pending');
    const hasPaid = dayEvents.some((e) => e.status === 'paid');

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{props.date.getDate()}</span>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-destructive" />}
            {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-warning" />}
            {hasPaid && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        month={currentMonth}
        onMonthChange={onMonthChange}
        locale={ptBR}
        className="rounded-md w-full"
        components={{
          DayContent: renderDay,
        }}
      />
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span>Atrasado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Pago</span>
        </div>
      </div>
    </Card>
  );
};
