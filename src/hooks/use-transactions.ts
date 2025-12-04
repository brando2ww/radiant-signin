import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { TransactionFormData } from '@/lib/validations/transaction';
import { format } from 'date-fns';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  description: string | null;
  category: string;
  amount: number;
  transaction_date: string;
  payment_method?: string | null;
  is_recurring: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useTransactions = (filters?: FilterState) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!user?.id) return [];

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate.toISOString().split('T')[0]);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate.toISOString().split('T')[0]);
    }

    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Erro ao carregar transações',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    return data || [];
  };

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: fetchTransactions,
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.from('transactions').insert([{
        type: data.type,
        description: data.description,
        category: data.category,
        amount: data.amount,
        transaction_date: format(data.transaction_date, 'yyyy-MM-dd'),
        payment_method: data.payment_method,
        is_recurring: data.is_recurring,
        user_id: user.id,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transação criada',
        description: 'A transação foi registrada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionFormData }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          ...data,
          transaction_date: format(data.transaction_date, 'yyyy-MM-dd'),
          amount: data.amount,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transação atualizada',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Primeiro, limpa a referência em qualquer lead que aponte para esta transação
      await supabase
        .from('crm_leads')
        .update({ converted_to_transaction_id: null })
        .eq('converted_to_transaction_id', id);

      // Agora exclui a transação
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      toast({
        title: 'Transação excluída',
        description: 'A transação foi removida com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    transactions,
    isLoading,
    refetch,
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
