import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

interface OperatorRank {
  operatorId: string;
  operatorName: string;
  score: number;
  onTimeCount: number;
  totalExecutions: number;
  badges: string[];
}

export function useOperatorRanking(periodType: "week" | "month" = "week") {
  const { user } = useAuth();

  const { periodStart, periodEnd } = useMemo(() => {
    const now = new Date();
    if (periodType === "week") {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { periodStart: start.toISOString().split("T")[0], periodEnd: end.toISOString().split("T")[0] };
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { periodStart: start.toISOString().split("T")[0], periodEnd: end.toISOString().split("T")[0] };
  }, [periodType]);

  const rankingQuery = useQuery({
    queryKey: ["operator-ranking", user?.id, periodType, periodStart],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get operators
      const { data: operators } = await supabase
        .from("checklist_operators")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!operators?.length) return [];

      // Get executions in period
      const { data: executions } = await supabase
        .from("checklist_executions")
        .select("id, operator_id, status, started_at, completed_at, score, schedule_id, checklist_schedules(max_duration_minutes)")
        .eq("user_id", user.id)
        .gte("execution_date", periodStart)
        .lte("execution_date", periodEnd);

      // Get execution items with star ratings
      const execIds = (executions || []).map((e) => e.id);
      let starData: Record<string, number[]> = {};
      if (execIds.length > 0) {
        const { data: items } = await supabase
          .from("checklist_execution_items")
          .select("execution_id, value, checklist_items(item_type)")
          .in("execution_id", execIds);

        (items || []).forEach((item: any) => {
          if (item.checklist_items?.item_type === "stars" && item.value != null) {
            const execId = item.execution_id;
            if (!starData[execId]) starData[execId] = [];
            starData[execId].push(Number(item.value));
          }
        });
      }

      const ranking: OperatorRank[] = operators.map((op) => {
        const opExecs = (executions || []).filter((e) => e.operator_id === op.id);
        const total = opExecs.length;
        if (total === 0) return { operatorId: op.id, operatorName: op.name, score: 0, onTimeCount: 0, totalExecutions: 0, badges: [] };

        const completed = opExecs.filter((e) => e.status === "concluido");
        const onTime = completed.filter((e) => {
          if (!e.started_at || !e.completed_at) return false;
          const maxMin = (e as any).checklist_schedules?.max_duration_minutes || 60;
          const elapsed = (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime()) / 60000;
          return elapsed <= maxMin;
        });

        const prazoScore = total > 0 ? (onTime.length / total) * 40 : 0;
        const completudeScore = total > 0 ? (completed.length / total) * 30 : 0;

        const allStars = opExecs.flatMap((e) => starData[e.id] || []);
        const avgStars = allStars.length > 0 ? allStars.reduce((a, b) => a + b, 0) / allStars.length : 5;
        const qualidadeScore = (avgStars / 5) * 30;

        const score = Math.round(prazoScore + completudeScore + qualidadeScore);

        const badges: string[] = [];
        if (completed.length === total && total > 0) badges.push("Semana Perfeita");

        return { operatorId: op.id, operatorName: op.name, score, onTimeCount: onTime.length, totalExecutions: total, badges };
      });

      ranking.sort((a, b) => b.score - a.score);

      // "Destaque do Mês" badge
      if (periodType === "month" && ranking.length > 0 && ranking[0].score > 0) {
        ranking[0].badges.push("Destaque do Mês");
      }

      return ranking;
    },
    enabled: !!user?.id,
  });

  return rankingQuery;
}

export function useScoreHistory(operatorId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["score-history", operatorId],
    queryFn: async () => {
      if (!user?.id || !operatorId) return [];
      const { data } = await supabase
        .from("operator_scores")
        .select("*")
        .eq("operator_id", operatorId)
        .eq("user_id", user.id)
        .order("period_start", { ascending: true })
        .limit(12);
      return data || [];
    },
    enabled: !!user?.id && !!operatorId,
  });
}

export function usePersistScore() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rank: OperatorRank & { periodStart: string; periodEnd: string }) => {
      if (!user?.id) throw new Error("No user");
      await supabase.from("operator_scores").upsert({
        operator_id: rank.operatorId,
        user_id: user.id,
        score: rank.score,
        on_time_count: rank.onTimeCount,
        total_executions: rank.totalExecutions,
        badges: rank.badges as any,
        period_start: rank.periodStart,
        period_end: rank.periodEnd,
      }, { onConflict: "operator_id,period_start,period_end" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-ranking"] }),
  });
}
