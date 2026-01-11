import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, History } from 'lucide-react';
import { useMonthlyGoals, MonthlyGoal } from '@/hooks/use-monthly-goals';
import { GoalDialog } from '@/components/monthly-goals/GoalDialog';
import { GoalCard } from '@/components/monthly-goals/GoalCard';
import { GoalHistory } from '@/components/monthly-goals/GoalHistory';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layouts/AppLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Goals = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<MonthlyGoal | null>(null);
  
  const currentMonthYear = format(new Date(), 'yyyy-MM');
  
  const {
    allActiveGoals,
    goalsHistory,
    goalProgress,
    isLoading,
    upsertGoal,
    isUpserting,
    deleteGoal,
    isDeleting,
    monthOptions,
  } = useMonthlyGoals(currentMonthYear);

  const handleEdit = (goal: MonthlyGoal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = (goal: MonthlyGoal) => {
    setDeletingGoal(goal);
  };

  const confirmDelete = () => {
    if (deletingGoal) {
      deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingGoal(null);
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  };

  return (
    <AppLayout className="p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2 md:gap-3">
              <Target className="h-7 w-7 md:h-10 md:w-10 text-primary" />
              Metas Mensais
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Defina e acompanhe suas metas financeiras mensais
            </p>
          </div>
          <Button onClick={handleNewGoal} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Metas Ativas */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas Ativas
          </h2>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-5 bg-muted rounded w-32 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-8 bg-muted rounded" />
                    <div className="h-8 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allActiveGoals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allActiveGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={goal.month_year === currentMonthYear ? goalProgress : null}
                  isCurrentMonth={goal.month_year === currentMonthYear}
                  onEdit={() => handleEdit(goal)}
                  onDelete={() => handleDelete(goal)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 md:py-12 px-4">
                <Target className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Nenhuma meta ativa
                </h3>
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                  Defina suas metas financeiras para começar a acompanhar seu progresso
                </p>
                <Button onClick={handleNewGoal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Histórico de Metas */}
        {goalsHistory.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Histórico de Metas
            </h2>
            <GoalHistory goals={goalsHistory} />
          </section>
        )}

        {/* Goal Dialog */}
        <GoalDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={upsertGoal}
          isSubmitting={isUpserting}
          goal={editingGoal}
          monthOptions={monthOptions}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Goals;
