import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ReviewStatus = Database["public"]["Enums"]["evidence_review_status"];

export interface EvidenceItem {
  executionItemId: string;
  photoUrl: string;
  itemTitle: string;
  checklistName: string;
  operatorName: string;
  sector: string;
  executionDate: string;
  reviewStatus: ReviewStatus | null;
  reviewComment: string | null;
}

interface EvidenceFilters {
  date?: string;
  sector?: string;
  operatorId?: string;
}

export function useEvidenceGallery(filters: EvidenceFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["evidence-gallery", user?.id, filters],
    queryFn: async (): Promise<EvidenceItem[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from("checklist_execution_items")
        .select(`
          id, photo_url, 
          checklist_items(title, checklist_id, checklists(name, sector)),
          checklist_executions!inner(id, execution_date, operator_id, user_id, checklist_operators(name))
        `)
        .not("photo_url", "is", null)
        .eq("checklist_executions.user_id", user.id);

      if (filters.date) {
        query = query.eq("checklist_executions.execution_date", filters.date);
      }
      if (filters.operatorId) {
        query = query.eq("checklist_executions.operator_id", filters.operatorId);
      }

      const { data, error } = await query.order("id", { ascending: false }).limit(100);
      if (error) throw error;

      // Fetch reviews for these items
      const itemIds = (data || []).map((d: any) => d.id);
      let reviews: Record<string, { status: ReviewStatus; comment: string | null }> = {};
      if (itemIds.length > 0) {
        const { data: revs } = await supabase
          .from("checklist_evidence_reviews")
          .select("execution_item_id, status, comment")
          .in("execution_item_id", itemIds);
        (revs || []).forEach((r: any) => {
          reviews[r.execution_item_id] = { status: r.status, comment: r.comment };
        });
      }

      return (data || []).map((d: any) => {
        const sector = d.checklist_items?.checklists?.sector || "";
        if (filters.sector && sector !== filters.sector) return null;
        return {
          executionItemId: d.id,
          photoUrl: d.photo_url,
          itemTitle: d.checklist_items?.title || "",
          checklistName: d.checklist_items?.checklists?.name || "",
          operatorName: d.checklist_executions?.checklist_operators?.name || "",
          sector,
          executionDate: d.checklist_executions?.execution_date || "",
          reviewStatus: reviews[d.id]?.status || null,
          reviewComment: reviews[d.id]?.comment || null,
        };
      }).filter(Boolean) as EvidenceItem[];
    },
    enabled: !!user?.id,
  });
}

export function useReviewEvidence() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ executionItemId, status, comment }: { executionItemId: string; status: ReviewStatus; comment?: string }) => {
      if (!user?.id) throw new Error("No user");
      const { error } = await supabase.from("checklist_evidence_reviews").upsert({
        execution_item_id: executionItemId,
        status,
        comment: comment || null,
        user_id: user.id,
      }, { onConflict: "execution_item_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evidence-gallery"] }),
  });
}
