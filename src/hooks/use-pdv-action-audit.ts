import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import type { PDVPermissionAction } from "@/hooks/use-pdv-permissions";
import type { AppRole } from "@/hooks/use-user-role";

export interface PDVAuditEntry {
  id: string;
  owner_user_id: string;
  actor_user_id: string;
  actor_role: AppRole | null;
  action: PDVPermissionAction;
  source_type: string | null;
  source_id: string | null;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

interface Filters {
  sourceId?: string | null;
  targetId?: string | null;
  limit?: number;
}

export function usePDVActionAudit({ sourceId, targetId, limit = 50 }: Filters = {}) {
  const { visibleUserId } = useEstablishmentId();

  return useQuery({
    queryKey: ["pdv-action-audit", visibleUserId, sourceId, targetId, limit],
    queryFn: async (): Promise<PDVAuditEntry[]> => {
      if (!visibleUserId) return [];
      let q = supabase
        .from("pdv_action_audit_log")
        .select("*")
        .eq("owner_user_id", visibleUserId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (sourceId) q = q.eq("source_id", sourceId);
      if (targetId) q = q.eq("target_id", targetId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as PDVAuditEntry[];
    },
    enabled: !!visibleUserId,
  });
}
