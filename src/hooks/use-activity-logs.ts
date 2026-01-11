import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'export' 
  | 'import' 
  | 'backup' 
  | 'restore';

export type EntityType = 
  | 'transaction' 
  | 'bank_account' 
  | 'credit_card' 
  | 'bill' 
  | 'goal' 
  | 'settings' 
  | 'lead' 
  | 'auth'
  | 'backup';

interface LogActivityParams {
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, unknown>;
}

export const useActivityLogs = (limit: number = 50) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity_logs', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
  });

  const logMutation = useMutation({
    mutationFn: async ({ action, entityType, entityId, details }: LogActivityParams) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          details: (details || null) as Json,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });

  const logActivity = (params: LogActivityParams) => {
    logMutation.mutate(params);
  };

  return {
    logs: logs || [],
    isLoading,
    logActivity,
  };
};

// Standalone function to log activity without hook context
export const logActivityDirect = async (
  userId: string,
  action: ActionType,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, unknown>
) => {
  try {
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: (details || null) as Json,
      }]);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
