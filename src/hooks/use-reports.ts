import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export interface PeriodFilter {
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export const useReports = (period: PeriodFilter, compare: boolean = false) => {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['report-transactions', user?.id, period.startDate, period.endDate],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', format(period.startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(period.endDate, 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: previousTransactions } = useQuery({
    queryKey: ['report-transactions-previous', user?.id, period.startDate],
    queryFn: async () => {
      if (!user || !compare) return [];
      
      const periodDiff = period.endDate.getTime() - period.startDate.getTime();
      const prevEndDate = new Date(period.startDate.getTime() - 1);
      const prevStartDate = new Date(prevEndDate.getTime() - periodDiff);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', format(prevStartDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(prevEndDate, 'yyyy-MM-dd'));

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && compare,
  });

  const reportData = useMemo(() => {
    if (!transactions) return null;

    const revenues = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalRevenue = revenues.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const profit = totalRevenue - totalExpense;

    // Revenue by category
    const revenueByCat = revenues.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const revenueByCategory: CategoryData[] = Object.entries(revenueByCat).map(([category, value]) => ({
      category,
      value,
      percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.value - a.value);

    // Expense by category
    const expenseByCat = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const expenseByCategory: CategoryData[] = Object.entries(expenseByCat).map(([category, value]) => ({
      category,
      value,
      percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
    })).sort((a, b) => b.value - a.value);

    // Monthly aggregation
    const monthlyMap = transactions.reduce((acc, t) => {
      const monthKey = format(new Date(t.transaction_date), 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, revenue: 0, expense: 0, profit: 0 };
      }
      
      if (t.type === 'income') {
        acc[monthKey].revenue += Number(t.amount);
      } else {
        acc[monthKey].expense += Number(t.amount);
      }
      acc[monthKey].profit = acc[monthKey].revenue - acc[monthKey].expense;
      
      return acc;
    }, {} as Record<string, MonthlyData>);

    const monthlyData = Object.values(monthlyMap);

    // Top transactions
    const topRevenues = revenues.sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);
    const topExpenses = expenses.sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    // Comparison with previous period
    let comparison = undefined;
    if (compare && previousTransactions) {
      const prevRevenue = previousTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const prevExpense = previousTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const prevProfit = prevRevenue - prevExpense;

      comparison = {
        revenue: {
          value: prevRevenue,
          change: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        },
        expense: {
          value: prevExpense,
          change: prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0,
        },
        profit: {
          value: prevProfit,
          change: prevProfit !== 0 ? ((profit - prevProfit) / Math.abs(prevProfit)) * 100 : 0,
        },
      };
    }

    return {
      summary: {
        totalRevenue,
        totalExpense,
        profit,
        profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
        transactionCount: transactions.length,
        averageTicket: revenues.length > 0 ? totalRevenue / revenues.length : 0,
      },
      revenueByCategory,
      expenseByCategory,
      monthlyData,
      topTransactions: {
        revenues: topRevenues,
        expenses: topExpenses,
      },
      comparison,
    };
  }, [transactions, previousTransactions, compare]);

  return {
    reportData,
    transactions: transactions || [],
    isLoading,
  };
};
