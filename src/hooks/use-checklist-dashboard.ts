import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

interface DashboardFilters {
  date: string;
  shift?: string;
  sector?: string;
  operatorId?: string;
}

export function useChecklistDashboard(filters?: DashboardFilters) {
  const { visibleUserId } = useEstablishmentId();
  const qc = useQueryClient();

  const date = filters?.date || new Date().toISOString().split("T")[0];

  // Daily metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["checklist-dashboard-metrics", visibleUserId, date],
    queryFn: async () => {
      if (!visibleUserId) return null;
      const { data, error } = await supabase
        .from("checklist_executions")
        .select("id, status, score, schedule_id, started_at, completed_at, operator_id, checklist_id, checklists(name, sector), checklist_operators(name)")
        .eq("user_id", visibleUserId)
        .eq("execution_date", date);

      if (error) throw error;
      const execs = data || [];
      const total = execs.length;
      const concluido = execs.filter((e: any) => e.status === "concluido").length;
      const atrasado = execs.filter((e: any) => e.status === "atrasado").length;
      const naoIniciado = execs.filter((e: any) => e.status === "pendente" || e.status === "nao_iniciado").length;
      const emAndamento = execs.filter((e: any) => e.status === "em_andamento").length;
      const avgScore = concluido > 0
        ? Math.round(execs.filter((e: any) => e.score != null).reduce((s: number, e: any) => s + e.score, 0) / concluido)
        : 0;

      return { total, concluido, atrasado, naoIniciado, emAndamento, avgScore, executions: execs };
    },
    enabled: !!visibleUserId,
  });

  // Completion chart (last 7 days)
  const { data: completionChart = [], isLoading: chartLoading } = useQuery({
    queryKey: ["checklist-completion-chart", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const days: { date: string; label: string; total: number; completed: number; pct: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, "yyyy-MM-dd");
        const label = format(d, "EEE");
        const { data } = await supabase
          .from("checklist_executions")
          .select("status")
          .eq("user_id", visibleUserId)
          .eq("execution_date", dateStr);

        const total = data?.length || 0;
        const completed = data?.filter((e: any) => e.status === "concluido").length || 0;
        days.push({ date: dateStr, label, total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 });
      }
      return days;
    },
    enabled: !!visibleUserId,
  });

  // Shift comparison
  const { data: shiftComparison = [], isLoading: shiftLoading } = useQuery({
    queryKey: ["checklist-shift-comparison", visibleUserId, date],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const { data: execs } = await supabase
        .from("checklist_executions")
        .select("status, schedule_id, checklist_schedules(shift)")
        .eq("user_id", visibleUserId)
        .eq("execution_date", date);

      const shifts: Record<string, { total: number; completed: number; late: number }> = {};
      (execs || []).forEach((e: any) => {
        const shift = e.checklist_schedules?.shift || "Sem turno";
        if (!shifts[shift]) shifts[shift] = { total: 0, completed: 0, late: 0 };
        shifts[shift].total++;
        if (e.status === "concluido") shifts[shift].completed++;
        if (e.status === "atrasado") shifts[shift].late++;
      });

      return Object.entries(shifts).map(([name, data]) => ({
        name,
        ...data,
        pct: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }));
    },
    enabled: !!visibleUserId,
  });

  // Alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["checklist-alerts", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const { data, error } = await supabase
        .from("checklist_alerts")
        .select("*, checklist_executions(checklists(name)), checklist_items(title)")
        .eq("user_id", visibleUserId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!visibleUserId,
  });

  const unacknowledgedAlerts = alerts.filter((a: any) => !a.is_acknowledged);

  // Acknowledge alert
  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, operatorId }: { alertId: string; operatorId?: string }) => {
      const { error } = await supabase
        .from("checklist_alerts")
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: operatorId || null,
        })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist-alerts"] }),
  });

  // Health percentage for widget
  const healthPct = metrics
    ? metrics.total > 0
      ? Math.round((metrics.concluido / metrics.total) * 100)
      : 100
    : null;

  return {
    metrics,
    completionChart,
    shiftComparison,
    alerts,
    unacknowledgedAlerts,
    healthPct,
    acknowledgeAlert: acknowledgeAlert.mutate,
    isLoading: metricsLoading || chartLoading || shiftLoading || alertsLoading,
    metricsLoading,
    chartLoading,
    shiftLoading,
    alertsLoading,
  };
}
