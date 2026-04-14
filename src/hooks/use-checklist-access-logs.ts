import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AccessLog {
  id: string;
  operatorId: string;
  operatorName: string;
  action: string;
  details: any;
  createdAt: string;
}

export function useAccessLogs(filters: { date?: string; operatorId?: string } = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["access-logs", user?.id, filters],
    queryFn: async (): Promise<AccessLog[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from("checklist_access_logs")
        .select("*, checklist_operators(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters.operatorId) {
        query = query.eq("operator_id", filters.operatorId);
      }
      if (filters.date) {
        query = query.gte("created_at", filters.date + "T00:00:00").lte("created_at", filters.date + "T23:59:59");
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        operatorId: d.operator_id,
        operatorName: d.checklist_operators?.name || "—",
        action: d.action,
        details: d.details,
        createdAt: d.created_at,
      }));
    },
    enabled: !!user?.id,
  });
}

export function useLogAccess() {
  return useMutation({
    mutationFn: async ({ userId, operatorId, action, details }: { userId: string; operatorId: string; action: string; details?: any }) => {
      await supabase.from("checklist_access_logs").insert({
        user_id: userId,
        operator_id: operatorId,
        action,
        details: details || {},
      });
    },
  });
}
