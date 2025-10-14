import { CalendarEvent } from '@/hooks/use-calendar-events';
import { EventCard } from './EventCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventsListProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
}

export const EventsList = ({ events, selectedDate }: EventsListProps) => {
  const filteredEvents = selectedDate
    ? events.filter(
        (event) =>
          event.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const key = event.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const typeLabels = {
    bill: 'Contas',
    transaction: 'Transações',
    card_due: 'Vencimentos de Cartão',
    card_closing: 'Fechamento de Fatura',
  };

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Selecione uma data no calendário
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="font-medium">Nenhum evento</p>
        <p className="text-sm mt-1">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-background pb-3 border-b z-10">
        <h3 className="font-semibold text-lg">
          {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
        </p>
      </div>

      {Object.entries(groupedEvents).map(([type, typeEvents]) => (
        <div key={type} className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            {typeLabels[type as keyof typeof typeLabels]} ({typeEvents.length})
          </h4>
          <div className="space-y-2">
            {typeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
