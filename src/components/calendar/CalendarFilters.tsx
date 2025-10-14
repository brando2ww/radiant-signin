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
    status: 'all' | 'pending' | 'paid' | 'overdue';
  };
  onFiltersChange: (filters: CalendarFiltersProps['filters']) => void;
}

export const CalendarFilters = ({ filters, onFiltersChange }: CalendarFiltersProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Filtros</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-bills" className="text-sm">
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
          <Label htmlFor="show-transactions" className="text-sm">
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
          <Label htmlFor="show-cards" className="text-sm">
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

        <div className="pt-2 border-t">
          <Label className="text-sm mb-2 block">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value as 'all' | 'pending' | 'paid' | 'overdue',
              })
            }
          >
            <SelectTrigger>
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
      </div>
    </Card>
  );
};
