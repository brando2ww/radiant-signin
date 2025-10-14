import { CalendarEvent } from '@/hooks/use-calendar-events';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: CalendarEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  const Icon = event.icon;
  
  const statusColors = {
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const statusLabels = {
    paid: 'Pago',
    pending: 'Pendente',
    overdue: 'Atrasado',
  };

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg" 
          style={{ backgroundColor: `${event.color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color: event.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{event.title}</h4>
              {event.description && (
                <p className="text-xs text-muted-foreground">{event.description}</p>
              )}
              {event.category && (
                <p className="text-xs text-muted-foreground mt-1">
                  {event.category}
                </p>
              )}
            </div>
            
            {event.amount && (
              <span className="font-semibold text-sm whitespace-nowrap">
                {event.type === 'transaction' && event.description?.includes('Receita') ? '+' : ''}
                R$ {event.amount.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {event.status && (
              <Badge 
                variant="outline" 
                className={`text-xs ${statusColors[event.status]}`}
              >
                {statusLabels[event.status]}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
