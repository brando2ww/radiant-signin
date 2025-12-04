import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar_url?: string;
  project_title: string;
  project_description?: string;
  estimated_value?: number;
  stage: 'incoming' | 'first_contact' | 'discussion' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'archived' | 'converted';
  tags?: string[];
  source?: string;
  first_contact_date?: string;
  last_contact_date?: string;
  expected_close_date?: string;
  closed_date?: string;
  converted_to_transaction_id?: string;
  win_probability?: number;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['crm-leads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user?.id,
  });
}

export function useLeadsByStage(stage: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['crm-leads-by-stage', stage, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('user_id', user.id)
        .eq('stage', stage)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateLead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('crm_leads')
        .insert({
          ...lead,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      toast.success('Lead criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar lead:', error);
      toast.error('Erro ao criar lead');
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      toast.success('Lead atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar lead:', error);
      toast.error('Erro ao atualizar lead');
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      toast.success('Lead excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
    },
  });
}

export function useMoveLeadToStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: string; newStage: string }) => {
      const { data, error } = await supabase
        .from('crm_leads')
        .update({ 
          stage: newStage,
          last_contact_date: new Date().toISOString(),
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
    },
    onError: (error) => {
      console.error('Erro ao mover lead:', error);
      toast.error('Erro ao mover lead');
    },
  });
}
