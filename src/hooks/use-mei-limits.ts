import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfYear, format } from 'date-fns';

const MEI_ANNUAL_LIMIT = 81000; // R$ 81.000,00

export const useMEILimits = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());

  const { data: yearlyTransactions, isLoading } = useQuery({
    queryKey: ['mei-yearly-transactions', user?.id, currentYear],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('transaction_date', format(yearStart, 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: dasBills, isLoading: isDASLoading } = useQuery({
    queryKey: ['das-bills', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'Tributárias')
        .order('due_date', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const meiData = useMemo(() => {
    if (!yearlyTransactions) return null;

    const yearlyRevenue = yearlyTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const percentageUsed = (yearlyRevenue / MEI_ANNUAL_LIMIT) * 100;

    const currentMonth = new Date().getMonth() + 1;
    const averageMonthly = yearlyRevenue / currentMonth;
    const projectedYearlyRevenue = averageMonthly * 12;

    // Current month DAS
    const currentDAS = dasBills?.[0];
    const dasAmount = currentDAS ? Number(currentDAS.amount) : 0;
    const dasStatus = currentDAS?.status || 'pending';

    return {
      yearlyRevenue,
      yearlyLimit: MEI_ANNUAL_LIMIT,
      percentageUsed,
      projectedYearlyRevenue,
      monthlyAverage: averageMonthly,
      dasAmount,
      dasStatus: dasStatus as 'paid' | 'pending' | 'overdue',
      dasHistory: dasBills || [],
    };
  }, [yearlyTransactions, dasBills]);

  return {
    meiData,
    isLoading: isLoading || isDASLoading,
  };
};
