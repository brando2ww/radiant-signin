import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Lead } from "./use-crm-leads";

export interface ConvertLeadData {
  leadId: string;
  saleValue: number;
  commissionPercentage: number;
  revenueValue: number;
  transactionDate: Date;
  paymentMethod: string;
  category: string;
  bankAccountId?: string;
  description?: string;
}

export function useConvertLead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConvertLeadData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // 1. Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'income',
          description: data.description || 'Comissão de venda (CRM)',
          category: data.category,
          amount: data.revenueValue,
          transaction_date: data.transactionDate.toISOString().split('T')[0],
          payment_method: data.paymentMethod,
          bank_account_id: data.bankAccountId || null,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 2. Update the lead to won status with transaction reference
      const { data: lead, error: leadError } = await supabase
        .from('crm_leads')
        .update({
          stage: 'won',
          status: 'converted',
          closed_date: new Date().toISOString(),
          converted_to_transaction_id: transaction.id,
        })
        .eq('id', data.leadId)
        .select()
        .single();

      if (leadError) throw leadError;

      return { transaction, lead };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Venda fechada e receita registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao converter lead:', error);
      toast.error('Erro ao registrar a venda');
    },
  });
}

export function useMarkLeadAsWon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase
        .from('crm_leads')
        .update({
          stage: 'won',
          status: 'converted',
          closed_date: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      toast.success('Lead marcado como ganho!');
    },
    onError: (error) => {
      console.error('Erro ao marcar lead como ganho:', error);
      toast.error('Erro ao atualizar lead');
    },
  });
}

export function useMarkLeadAsLost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, reason }: { leadId: string; reason?: string }) => {
      const updateData: Record<string, unknown> = {
        stage: 'lost',
        status: 'archived',
        closed_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('crm_leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      toast.success('Lead marcado como perdido');
    },
    onError: (error) => {
      console.error('Erro ao marcar lead como perdido:', error);
      toast.error('Erro ao atualizar lead');
    },
  });
}
