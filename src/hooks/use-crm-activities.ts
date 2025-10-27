import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Activity {
  id: string;
  user_id: string;
  lead_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'proposal';
  title: string;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useActivitiesByLead(leadId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['crm-activities', leadId, user?.id],
    queryFn: async () => {
      if (!user?.id || !leadId) return [];

      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user?.id && !!leadId,
  });
}

export function useCreateActivity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('crm_activities')
        .insert({
          ...activity,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', variables.lead_id] });
      toast.success('Atividade criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar atividade:', error);
      toast.error('Erro ao criar atividade');
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, lead_id, ...updates }: Partial<Activity> & { id: string; lead_id: string }) => {
      const { data, error } = await supabase
        .from('crm_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, lead_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', result.lead_id] });
      toast.success('Atividade atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar atividade:', error);
      toast.error('Erro ao atualizar atividade');
    },
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, lead_id }: { id: string; lead_id: string }) => {
      const { data, error } = await supabase
        .from('crm_activities')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, lead_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', result.lead_id] });
      toast.success('Atividade marcada como concluída!');
    },
    onError: (error) => {
      console.error('Erro ao completar atividade:', error);
      toast.error('Erro ao completar atividade');
    },
  });
}
