import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotesByLead(leadId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['crm-notes', leadId, user?.id],
    queryFn: async () => {
      if (!user?.id || !leadId) return [];

      const { data, error } = await supabase
        .from('crm_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lead_id', leadId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user?.id && !!leadId,
  });
}

export function useCreateNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('crm_notes')
        .insert({
          ...note,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
      toast.success('Nota criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar nota:', error);
      toast.error('Erro ao criar nota');
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
      toast.success('Nota atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar nota:', error);
      toast.error('Erro ao atualizar nota');
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
      toast.success('Nota excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir nota:', error);
      toast.error('Erro ao excluir nota');
    },
  });
}
