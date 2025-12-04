import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface CalendarFiltersProps {
  filters: {
    showBills: boolean;
    showTransactions: boolean;
    showCards: boolean;
    showTasks: boolean;
    status: 'all' | 'pending' | 'paid' | 'overdue';
  };
  onFiltersChange: (filters: CalendarFiltersProps['filters']) => void;
}

export const CalendarFilters = ({ filters, onFiltersChange }: CalendarFiltersProps) => {
  return (
    <Card className="p-4 space-y-3">
      <h4 className="font-medium text-sm">Filtros</h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-bills" className="text-sm text-muted-foreground">
            Contas
          </Label>
          <Switch
            id="show-bills"
            checked={filters.showBills}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, showBills: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-transactions" className="text-sm text-muted-foreground">
            Transações
          </Label>
          <Switch
            id="show-transactions"
            checked={filters.showTransactions}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, showTransactions: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-cards" className="text-sm text-muted-foreground">
            Cartões
          </Label>
          <Switch
            id="show-cards"
            checked={filters.showCards}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, showCards: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-tasks" className="text-sm text-muted-foreground">
            Tarefas
          </Label>
          <Switch
            id="show-tasks"
            checked={filters.showTasks}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, showTasks: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <Label className="text-sm font-medium">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as 'all' | 'pending' | 'paid' | 'overdue',
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
