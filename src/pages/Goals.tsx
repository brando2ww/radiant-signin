import { useState } from 'react';
import { SessionNavBar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Plus, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { useMonthlyGoals } from '@/hooks/use-monthly-goals';
import { GoalDialog } from '@/components/monthly-goals/GoalDialog';
import { GoalProgress } from '@/components/monthly-goals/GoalProgress';
import { GoalHistory } from '@/components/monthly-goals/GoalHistory';
import { format, addMonths, subMonths } from 'date-fns';

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
    <div className="flex h-screen w-full flex-row">
      <SessionNavBar />
      <main className="ml-[3.05rem] flex h-screen grow flex-col overflow-auto p-8 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Target className="h-10 w-10 text-primary" />
                Metas Mensais
              </h1>
              <p className="text-muted-foreground">
                Defina e acompanhe suas metas financeiras mensais
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-2xl font-bold min-w-[200px] text-center">
                    {formatMonthYear(selectedMonth)}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToday}
                    className="ml-2"
                  >
                    Hoje
                  </Button>
                </div>

                <Button onClick={() => setIsDialogOpen(true)}>
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
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma meta definida para {formatMonthYear(selectedMonth)}
                </h3>
                <p className="text-muted-foreground mb-4">
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
      </main>
    </div>
  );
};

export default Goals;
