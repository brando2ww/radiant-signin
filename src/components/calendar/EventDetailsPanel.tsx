import { CalendarEvent } from '@/hooks/use-calendar-events';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, CreditCard, Receipt, Pencil, Trash2, Check, Clock, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetailsPanelProps {
  event: CalendarEvent | null;
}

export const EventDetailsPanel = ({ event }: EventDetailsPanelProps) => {
  if (!event) {
    return (
      <Card className="p-8 text-center h-full flex items-center justify-center">
        <div className="space-y-2">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Selecione um evento na timeline para ver os detalhes
          </p>
        </div>
      </Card>
    );
  }

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

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'bill':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'transaction':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'card_due':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'card_closing':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'task':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
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

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-500/10 text-slate-700 border-slate-200';
      case 'medium': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'urgent': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-3">
        <Badge variant="outline" className={cn('text-xs', getCategoryColor(event.type))}>
          {getTypeLabel(event.type)}
        </Badge>

        <h2 className="text-2xl font-bold">{event.title}</h2>

        {event.description && (
          <p className="text-muted-foreground">{event.description}</p>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Data</p>
            <p className="text-sm text-muted-foreground">
              {format(event.date, "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {event.amount && (
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Valor</p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(event.amount))}
              </p>
            </div>
          </div>
        )}

        {event.category && (
          <div className="flex items-center gap-3">
            <event.icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Categoria</p>
              <p className="text-sm text-muted-foreground">{event.category}</p>
            </div>
          </div>
        )}

        {event.status && (
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant="outline" className={cn('text-xs mt-1', getStatusColor(event.status))}>
                {event.status === 'paid' && (event.type === 'task' ? 'Concluída' : 'Pago')}
                {event.status === 'pending' && 'Pendente'}
                {event.status === 'overdue' && (event.type === 'task' ? 'Cancelada' : 'Atrasado')}
              </Badge>
            </div>
          </div>
        )}

        {event.type === 'task' && event.priority && (
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Prioridade</p>
              <Badge variant="outline" className={cn('text-xs mt-1', getPriorityColor(event.priority))}>
                {getPriorityLabel(event.priority)}
              </Badge>
            </div>
          </div>
        )}

        {event.type === 'task' && event.endDate && (
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Término</p>
              <p className="text-sm text-muted-foreground">
                {format(event.endDate, "HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        {event.status === 'pending' && (
          <Button className="flex-1" size="sm">
            <Check className="h-4 w-4 mr-2" />
            {event.type === 'task' ? 'Concluir' : 'Marcar como Pago'}
          </Button>
        )}
        <Button variant="outline" size="sm" className="flex-1">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
