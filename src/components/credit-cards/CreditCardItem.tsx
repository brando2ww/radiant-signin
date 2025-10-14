import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Lock, MoreVertical } from 'lucide-react';
import { CreditCard } from '@/hooks/use-credit-cards';
import { getBrandLabel } from '@/data/card-brands';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CreditCardItemProps {
  card: CreditCard;
  onViewDetails: (card: CreditCard) => void;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
}

export function CreditCardItem({ card, onViewDetails, onEdit, onDelete }: CreditCardItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const limitUsage = ((card.current_balance || 0) / (card.credit_limit || 1)) * 100;
  const daysUntilDue = getDaysUntilDue(card.due_day || 10);
  const gradientClass = card.color?.includes('gradient') 
    ? `bg-gradient-to-br ${card.color}` 
    : '';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <div 
        className={`h-48 p-6 ${gradientClass || 'bg-gradient-to-br from-gray-600 to-gray-400'} text-white flex flex-col justify-between`}
        style={!gradientClass ? { background: card.color || '#6B7280' } : {}}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{card.name}</h3>
            <p className="text-sm opacity-90">{getBrandLabel(card.brand || '')}</p>
          </div>
          {daysUntilDue <= 5 && (
            <Badge variant="destructive" className="animate-pulse">
              Vence em {daysUntilDue}d
            </Badge>
          )}
          {limitUsage > 80 && (
            <Badge variant="destructive" className="animate-pulse">
              Limite alto
            </Badge>
          )}
        </div>

        <div>
          <p className="text-2xl font-mono tracking-wider">
            •••• {card.last_four_digits || '****'}
          </p>
        </div>
      </div>

      <CardContent className="pt-4 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Fatura Atual</span>
            <span className="font-semibold">{formatCurrency(card.current_balance || 0)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Limite Total</span>
            <span className="font-semibold">{formatCurrency(card.credit_limit || 0)}</span>
          </div>
          <Progress 
            value={limitUsage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-1">{limitUsage.toFixed(0)}% utilizado</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Vence: {card.due_day || '-'}/mês</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Fecha: {card.closing_day || '-'}/mês</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(card)}
          >
            Ver Detalhes
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(card)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(card)}
                className="text-destructive"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
