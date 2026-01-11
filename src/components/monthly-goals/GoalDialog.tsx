import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { MonthlyGoal } from '@/hooks/use-monthly-goals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<MonthlyGoal> & { month_year?: string }) => void;
  isSubmitting: boolean;
  goal?: MonthlyGoal | null;
  monthOptions: { value: string; label: string }[];
}

export function GoalDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  goal,
  monthOptions,
}: GoalDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [revenueGoal, setRevenueGoal] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');

  useEffect(() => {
    if (goal) {
      setSelectedMonth(goal.month_year);
      setRevenueGoal(goal.revenue_goal?.toString() || '');
      setSavingsGoal(goal.savings_goal?.toString() || '');
      setInvestmentGoal(goal.investment_goal?.toString() || '');
    } else {
      // Default to current month for new goals
      setSelectedMonth(format(new Date(), 'yyyy-MM'));
      setRevenueGoal('');
      setSavingsGoal('');
      setInvestmentGoal('');
    }
  }, [goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      month_year: selectedMonth,
      revenue_goal: revenueGoal ? parseFloat(revenueGoal) : null,
      savings_goal: savingsGoal ? parseFloat(savingsGoal) : null,
      investment_goal: investmentGoal ? parseFloat(investmentGoal) : null,
    });

    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const formatMonthLabel = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy', { locale: ptBR });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Editar Meta' : 'Nova Meta'}
          </DialogTitle>
          <DialogDescription>
            Defina suas metas financeiras para o mês. Deixe em branco os campos que não deseja configurar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Month Selector - Only show when creating new goal */}
            {!goal && (
              <div className="space-y-2">
                <Label htmlFor="month">Mês da Meta</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês">
                      {selectedMonth && (
                        <span className="capitalize">{formatMonthLabel(selectedMonth)}</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="capitalize">{formatMonthLabel(option.value)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha o mês para definir suas metas
                </p>
              </div>
            )}

            {goal && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium capitalize">
                  {formatMonthLabel(goal.month_year)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="revenue">Meta de Receita</Label>
              <CurrencyInput
                id="revenue"
                value={revenueGoal}
                onChange={setRevenueGoal}
              />
              <p className="text-xs text-muted-foreground">
                Quanto você pretende faturar neste mês?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="savings">Meta de Economia</Label>
              <CurrencyInput
                id="savings"
                value={savingsGoal}
                onChange={setSavingsGoal}
              />
              <p className="text-xs text-muted-foreground">
                Quanto você pretende economizar neste mês?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment">Meta de Investimento</Label>
              <CurrencyInput
                id="investment"
                value={investmentGoal}
                onChange={setInvestmentGoal}
              />
              <p className="text-xs text-muted-foreground">
                Quanto você pretende investir neste mês?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedMonth}>
              {isSubmitting ? 'Salvando...' : 'Salvar Meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
