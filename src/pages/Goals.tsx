import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Plus, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { useMonthlyGoals } from '@/hooks/use-monthly-goals';
import { GoalDialog } from '@/components/monthly-goals/GoalDialog';
import { GoalProgress } from '@/components/monthly-goals/GoalProgress';
import { GoalHistory } from '@/components/monthly-goals/GoalHistory';
import { format, addMonths, subMonths } from 'date-fns';
import { AppLayout } from '@/components/layouts/AppLayout';

const Goals = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const monthYear = format(selectedMonth, 'yyyy-MM');
  const {
    currentGoal,
    goalsHistory,
    goalProgress,
    isLoading,
    upsertGoal,
    isUpserting,
  } = useMonthlyGoals(monthYear);

  const formatMonthYear = (date: Date) => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatMonthYearShort = (date: Date) => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const handleToday = () => {
    setSelectedMonth(new Date());
  };

  return (
    <AppLayout className="p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header - Mobile Responsive */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2 md:gap-3">
            <Target className="h-7 w-7 md:h-10 md:w-10 text-primary" />
            Metas Mensais
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Defina e acompanhe suas metas financeiras mensais
          </p>
        </div>

        {/* Month Selector - Mobile Responsive */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-8 w-8 md:h-10 md:w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg md:text-2xl font-bold min-w-[120px] md:min-w-[200px] text-center">
                  <span className="hidden sm:inline">{formatMonthYear(selectedMonth)}</span>
                  <span className="sm:hidden">{formatMonthYearShort(selectedMonth)}</span>
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-8 w-8 md:h-10 md:w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToday}
                  size="sm"
                  className="ml-1 md:ml-2"
                >
                  Hoje
                </Button>
              </div>

              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                {currentGoal ? (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar Metas
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Definir Metas
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        {goalProgress ? (
          <div className="mb-6">
            <GoalProgress progress={goalProgress} />
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="text-center py-8 md:py-12 px-4">
              <Target className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Nenhuma meta definida para {formatMonthYearShort(selectedMonth)}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                Defina suas metas financeiras para começar a acompanhar seu progresso
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Definir Metas
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Goal History */}
        <GoalHistory goals={goalsHistory} />

        {/* Goal Dialog */}
        <GoalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={upsertGoal}
          isSubmitting={isUpserting}
          goal={currentGoal}
          monthYear={monthYear}
        />
      </div>
    </AppLayout>
  );
};

export default Goals;
