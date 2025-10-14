import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CreditCardFormData } from '@/lib/validations/credit-card';

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  last_four_digits: string | null;
  credit_limit: number | null;
  current_balance: number | null;
  due_day: number | null;
  closing_day: number | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useCreditCards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cards, isLoading } = useQuery({
    queryKey: ['credit_cards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditCard[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreditCardFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          name: data.name,
          brand: data.brand,
          last_four_digits: data.last_four_digits || null,
          credit_limit: data.credit_limit,
          current_balance: 0,
          due_day: data.due_day,
          closing_day: data.closing_day,
          color: data.color,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: 'Sucesso!',
        description: 'Cartão adicionado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar cartão. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error creating credit card:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreditCardFormData> }) => {
      const { error } = await supabase
        .from('credit_cards')
        .update({
          name: data.name,
          brand: data.brand,
          last_four_digits: data.last_four_digits || null,
          credit_limit: data.credit_limit,
          due_day: data.due_day,
          closing_day: data.closing_day,
          color: data.color,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: 'Sucesso!',
        description: 'Cartão atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar cartão. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error updating credit card:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: 'Sucesso!',
        description: 'Cartão excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cartão. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error deleting credit card:', error);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('credit_cards')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: 'Sucesso!',
        description: 'Status do cartão atualizado.',
      });
    },
  });

  return {
    cards: cards || [],
    isLoading,
    createCard: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCard: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCard: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
  };
};
