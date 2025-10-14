import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard } from './use-credit-cards';

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  category: string;
  transaction_date: string;
  type: string;
  payment_method: string | null;
}

interface InvoiceData {
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  transactions: Transaction[];
  total: number;
}

export const useCardTransactions = (card: CreditCard | null) => {
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['card_transactions', card?.id],
    queryFn: async (): Promise<InvoiceData | null> => {
      if (!card) return null;

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Determinar período da fatura
      let periodStart: Date;
      let periodEnd: Date;
      let dueDate: Date;
      
      if (today.getDate() >= (card.closing_day || 1)) {
        // Após o fechamento
        periodStart = new Date(currentYear, currentMonth, card.closing_day || 1);
        periodEnd = new Date(currentYear, currentMonth + 1, (card.closing_day || 1) - 1);
        dueDate = new Date(currentYear, currentMonth + 1, card.due_day || 10);
      } else {
        // Antes do fechamento
        periodStart = new Date(currentYear, currentMonth - 1, card.closing_day || 1);
        periodEnd = new Date(currentYear, currentMonth, (card.closing_day || 1) - 1);
        dueDate = new Date(currentYear, currentMonth, card.due_day || 10);
      }
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('credit_card_id', card.id)
        .gte('transaction_date', periodStart.toISOString().split('T')[0])
        .lte('transaction_date', periodEnd.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const total = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        periodStart,
        periodEnd,
        dueDate,
        transactions: transactions || [],
        total,
      };
    },
    enabled: !!card,
  });

  return {
    invoiceData,
    isLoading,
  };
};
