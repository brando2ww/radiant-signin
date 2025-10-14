import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  date: Date;
  time?: string;
  title: string;
  amount?: number;
  type: 'bill' | 'transaction' | 'card_due' | 'card_closing';
  category?: string;
  status?: 'pending' | 'paid' | 'overdue';
  description?: string;
  icon: LucideIcon;
  color: string;
}

export const useCalendarEvents = (selectedMonth: Date, filters: {
  showBills: boolean;
  showTransactions: boolean;
  showCards: boolean;
  status: 'all' | 'pending' | 'paid' | 'overdue';
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['calendar-events', user?.id, selectedMonth, filters],
    queryFn: async () => {
      if (!user) return [];

      const events: CalendarEvent[] = [];
      const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      // Fetch bills
      if (filters.showBills) {
        const { data: bills } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .gte('due_date', monthStart.toISOString().split('T')[0])
          .lte('due_date', monthEnd.toISOString().split('T')[0]);

        if (bills) {
          bills.forEach((bill) => {
            const today = new Date();
            const dueDate = new Date(bill.due_date);
            let status: 'pending' | 'paid' | 'overdue' = 'pending';
            
            if (bill.paid_at) {
              status = 'paid';
            } else if (dueDate < today) {
              status = 'overdue';
            }

            if (filters.status === 'all' || filters.status === status) {
              events.push({
                id: bill.id,
                date: new Date(dueDate.setHours(9, 0, 0, 0)),
                time: '09:00',
                title: bill.title,
                amount: Number(bill.amount),
                type: 'bill',
                category: bill.category || undefined,
                status,
                description: bill.type === 'income' ? 'Conta a receber' : 'Conta a pagar',
                icon: bill.type === 'income' ? TrendingUp : TrendingDown,
                color: bill.type === 'income' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
              });
            }
          });
        }
      }

      // Fetch transactions
      if (filters.showTransactions) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('transaction_date', monthStart.toISOString().split('T')[0])
          .lte('transaction_date', monthEnd.toISOString().split('T')[0]);

        if (transactions) {
          transactions.forEach((transaction) => {
            if (filters.status === 'all' || filters.status === 'paid') {
              const transactionDate = new Date(transaction.transaction_date);
              events.push({
                id: transaction.id,
                date: transactionDate,
                time: transactionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                title: transaction.description || 'Transação',
                amount: Number(transaction.amount),
                type: 'transaction',
                category: transaction.category,
                status: 'paid',
                description: transaction.type === 'income' ? 'Receita' : 'Despesa',
                icon: transaction.type === 'income' ? CheckCircle : XCircle,
                color: transaction.type === 'income' ? 'hsl(var(--success))' : 'hsl(var(--primary))',
              });
            }
          });
        }
      }

      // Fetch credit cards for due and closing dates
      if (filters.showCards) {
        const { data: cards } = await supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (cards) {
          cards.forEach((card) => {
            // Add due date event
            if (card.due_day) {
              const dueDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), card.due_day);
              if (dueDate >= monthStart && dueDate <= monthEnd) {
                const today = new Date();
                let status: 'pending' | 'paid' | 'overdue' = 'pending';
                if (dueDate < today) status = 'overdue';

                if (filters.status === 'all' || filters.status === status) {
                  events.push({
                    id: `${card.id}-due`,
                    date: new Date(dueDate.setHours(9, 0, 0, 0)),
                    time: '09:00',
                    title: `Vencimento ${card.name}`,
                    amount: Number(card.current_balance || 0),
                    type: 'card_due',
                    category: 'Cartão de Crédito',
                    status,
                    description: `Fatura vence dia ${card.due_day}`,
                    icon: CreditCard,
                    color: 'hsl(var(--chart-1))',
                  });
                }
              }
            }

            // Add closing date event
            if (card.closing_day) {
              const closingDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), card.closing_day);
              if (closingDate >= monthStart && closingDate <= monthEnd) {
                if (filters.status === 'all' || filters.status === 'pending') {
                  events.push({
                    id: `${card.id}-closing`,
                    date: new Date(closingDate.setHours(23, 59, 0, 0)),
                    time: '23:59',
                    title: `Fechamento ${card.name}`,
                    amount: Number(card.current_balance || 0),
                    type: 'card_closing',
                    category: 'Cartão de Crédito',
                    status: 'pending',
                    description: `Fatura fecha dia ${card.closing_day}`,
                    icon: AlertCircle,
                    color: 'hsl(var(--chart-2))',
                  });
                }
              }
            }
          });
        }
      }

      return events.sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // If same date, sort by time
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
    },
    enabled: !!user,
  });
};
