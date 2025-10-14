import { useMemo } from 'react';
import { Transaction } from './use-transactions';

export const useTransactionStats = (transactions: Transaction[]) => {
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Calculate trends (comparing with previous period)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= currentMonthStart;
    });

    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= previousMonthStart && date <= previousMonthEnd;
    });

    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeTrend = previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : 0;

    const expenseTrend = previousExpense > 0 
      ? ((currentExpense - previousExpense) / previousExpense) * 100 
      : 0;

    const previousBalance = previousIncome - previousExpense;
    const currentBalance = currentIncome - currentExpense;
    const balanceTrend = previousBalance !== 0
      ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100
      : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      incomeTrend,
      expenseTrend,
      balanceTrend,
      incomeCount: transactions.filter(t => t.type === 'income').length,
      expenseCount: transactions.filter(t => t.type === 'expense').length,
    };
  }, [transactions]);

  return stats;
};
