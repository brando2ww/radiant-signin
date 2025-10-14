import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockStats,
  mockCashFlowData,
  mockUpcomingBills,
  mockCreditCards,
  mockMonthlyGoals,
  mockAlerts,
  mockRevenueByCategory,
  mockMEIInfo,
} from '@/data/mock-dashboard-data';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Por enquanto, usando dados mockados
  // TODO: Implementar fetching real dos dados do Supabase
  const [stats] = useState(mockStats);
  const [cashFlowData] = useState(mockCashFlowData);
  const [upcomingBills] = useState(mockUpcomingBills);
  const [creditCards] = useState(mockCreditCards);
  const [monthlyGoals] = useState(mockMonthlyGoals);
  const [alerts] = useState(mockAlerts);
  const [revenueByCategory] = useState(mockRevenueByCategory);
  const [meiInfo] = useState(mockMEIInfo);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);

      try {
        // TODO: Implementar queries reais do Supabase
        // Exemplo de query para transactions:
        // const { data: transactions } = await supabase
        //   .from('transactions')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('transaction_date', { ascending: false });

        // Por enquanto, simulando delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return {
    stats,
    cashFlowData,
    upcomingBills,
    creditCards,
    monthlyGoals,
    alerts,
    revenueByCategory,
    meiInfo,
    isLoading,
  };
};
