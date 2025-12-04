import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MonthlyGoal } from '@/hooks/use-monthly-goals';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<MonthlyGoal>) => void;
  isSubmitting: boolean;
  goal?: MonthlyGoal | null;
  monthYear: string;
}

export function GoalDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  goal,
  monthYear,
}: GoalDialogProps) {
  const [revenueGoal, setRevenueGoal] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');

  useEffect(() => {
    if (goal) {
      setRevenueGoal(goal.revenue_goal?.toString() || '');
      setSavingsGoal(goal.savings_goal?.toString() || '');
      setInvestmentGoal(goal.investment_goal?.toString() || '');
    } else {
      setRevenueGoal('');
      setSavingsGoal('');
      setInvestmentGoal('');
    }
  }, [goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      revenue_goal: revenueGoal ? parseFloat(revenueGoal) : null,
      savings_goal: savingsGoal ? parseFloat(savingsGoal) : null,
      investment_goal: investmentGoal ? parseFloat(investmentGoal) : null,
    });

    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Editar Metas' : 'Definir Metas'} - {formatMonthYear(monthYear)}
          </DialogTitle>
          <DialogDescription>
            Defina suas metas financeiras para o mês. Deixe em branco os campos que não deseja configurar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Meta de Receita (R$)</Label>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                min="0"
                placeholder="R$ 0,00"
                value={revenueGoal}
                onChange={(e) => setRevenueGoal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Quanto você pretende faturar neste mês?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="savings">Meta de Economia (R$)</Label>
              <Input
                id="savings"
                type="number"
                step="0.01"
                min="0"
                placeholder="R$ 0,00"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Quanto você pretende economizar neste mês?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment">Meta de Investimento (R$)</Label>
              <Input
                id="investment"
                type="number"
                step="0.01"
                min="0"
                placeholder="R$ 0,00"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Metas'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
