import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export interface MonthlyGoal {
  id: string;
  user_id: string;
  month_year: string;
  revenue_goal: number | null;
  savings_goal: number | null;
  investment_goal: number | null;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  revenue: {
    goal: number;
    current: number;
    percentage: number;
  };
  savings: {
    goal: number;
    current: number;
    percentage: number;
  };
  investment: {
    goal: number;
    current: number;
    percentage: number;
  };
}

export function useMonthlyGoals(monthYear?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentMonthYear = monthYear || format(new Date(), 'yyyy-MM');

  // Buscar meta do mês específico
  const { data: currentGoal, isLoading } = useQuery({
    queryKey: ['monthly-goal', user?.id, currentMonthYear],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Buscar todas as metas ativas (mês atual + futuros)
  const { data: allActiveGoals } = useQuery({
    queryKey: ['all-active-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .gte('month_year', currentMonth)
        .order('month_year', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Buscar histórico de metas (meses passados)
  const { data: goalsHistory } = useQuery({
    queryKey: ['monthly-goals-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .lt('month_year', currentMonth)
        .order('month_year', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Buscar transações do mês para calcular progresso
  const { data: transactions } = useQuery({
    queryKey: ['transactions-for-goals', user?.id, currentMonthYear],
    queryFn: async () => {
      if (!user) return [];
      
      const [year, month] = currentMonthYear.split('-');
      const monthStart = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const monthEnd = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', monthStart.toISOString())
        .lte('transaction_date', monthEnd.toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calcular progresso
  const goalProgress: GoalProgress | null = (() => {
    if (!currentGoal || !transactions) return null;

    const currentRevenue = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // TODO: Implementar cálculo real de savings e investment quando tiver mais dados
    const currentSavings = 0;
    const currentInvestment = 0;

    return {
      revenue: {
        goal: Number(currentGoal.revenue_goal) || 0,
        current: currentRevenue,
        percentage: currentGoal.revenue_goal 
          ? Math.min((currentRevenue / Number(currentGoal.revenue_goal)) * 100, 100)
          : 0,
      },
      savings: {
        goal: Number(currentGoal.savings_goal) || 0,
        current: currentSavings,
        percentage: currentGoal.savings_goal
          ? Math.min((currentSavings / Number(currentGoal.savings_goal)) * 100, 100)
          : 0,
      },
      investment: {
        goal: Number(currentGoal.investment_goal) || 0,
        current: currentInvestment,
        percentage: currentGoal.investment_goal
          ? Math.min((currentInvestment / Number(currentGoal.investment_goal)) * 100, 100)
          : 0,
      },
    };
  })();

  // Criar ou atualizar meta
  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<MonthlyGoal> & { month_year?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const goalData = {
        user_id: user.id,
        month_year: data.month_year || currentMonthYear,
        revenue_goal: data.revenue_goal || null,
        savings_goal: data.savings_goal || null,
        investment_goal: data.investment_goal || null,
      };

      const { data: result, error } = await supabase
        .from('monthly_goals')
        .upsert(goalData, {
          onConflict: 'user_id,month_year',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-goal'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-goals-history'] });
      queryClient.invalidateQueries({ queryKey: ['all-active-goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Metas atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar metas:', error);
      toast.error('Erro ao salvar metas');
    },
  });

  // Deletar meta
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('monthly_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-goal'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-goals-history'] });
      queryClient.invalidateQueries({ queryKey: ['all-active-goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Meta excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao excluir meta');
    },
  });

  // Gerar opções de meses (próximos 12 meses)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  return {
    currentGoal,
    allActiveGoals: allActiveGoals || [],
    goalsHistory: goalsHistory || [],
    goalProgress,
    isLoading,
    upsertGoal: upsertMutation.mutate,
    isUpserting: upsertMutation.isPending,
    deleteGoal: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    monthOptions,
  };
}
