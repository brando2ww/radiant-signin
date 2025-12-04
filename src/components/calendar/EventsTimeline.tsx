import { CalendarEvent } from '@/hooks/use-calendar-events';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventsTimelineProps {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  onSelectEvent: (event: CalendarEvent) => void;
  selectedDate?: Date;
}

export const EventsTimeline = ({
  events,
  selectedEvent,
  onSelectEvent,
  selectedDate,
}: EventsTimelineProps) => {
  // Filter events by selected date if provided
  const filteredEvents = selectedDate
    ? events.filter((event) => isSameDay(event.date, selectedDate))
    : events;

  // Group events by date
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const dateKey = format(event.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bill':
        return 'Conta';
      case 'transaction':
        return 'Transação';
      case 'card_due':
        return 'Vencimento Cartão';
      case 'card_closing':
        return 'Fechamento Fatura';
      case 'task':
        return 'Tarefa';
      default:
        return type;
    }
  };

  if (filteredEvents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum evento encontrado para esta data
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
        <div key={dateKey}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {format(new Date(dateKey), "d 'de' MMMM", { locale: ptBR })}
          </h3>
          <div className="space-y-2">
            {dateEvents.map((event) => (
              <Card
                key={event.id}
                className={cn(
                  'p-4 cursor-pointer transition-all hover:bg-muted/50',
                  selectedEvent?.id === event.id &&
                    'bg-primary/10 border-primary'
                )}
                onClick={() => onSelectEvent(event)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-2xl font-bold">
                      {format(event.date, 'HH:mm')}
                    </span>
                    {event.time && (
                      <span className="text-xs text-muted-foreground">
                        {event.time}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium truncate">{event.title}</h4>
                      {event.status && (
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getStatusColor(event.status))}
                        >
                          {event.status === 'paid' && 'Pago'}
                          {event.status === 'pending' && 'Pendente'}
                          {event.status === 'overdue' && 'Atrasado'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <event.icon className="h-4 w-4" />
                      <span>{getTypeLabel(event.type)}</span>
                      {event.category && (
                        <>
                          <span>•</span>
                          <span>{event.category}</span>
                        </>
                      )}
                    </div>

                    {event.amount && (
                      <p className="text-sm font-medium mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(event.amount))}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
