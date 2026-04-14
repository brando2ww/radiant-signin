import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export type DailyTaskStatus = "pending" | "in_progress" | "done" | "overdue" | "done_late" | "skipped";

export interface DailyTask {
  id: string; // schedule id or execution id
  scheduleId: string;
  checklistId: string;
  checklistName: string;
  checklistColor: string | null;
  sector: string;
  shift: string;
  startTime: string;
  maxDurationMinutes: number;
  deadlineTime: string; // calculated start + duration
  assignedOperatorId: string | null;
  assignedOperatorName: string | null;
  assignedSector: string | null;
  executionId: string | null;
  executionStatus: string | null;
  startedAt: string | null;
  completedAt: string | null;
  score: number | null;
  status: DailyTaskStatus;
  hasCriticalItems: boolean;
  totalItems: number;
  completedItems: number;
}

export interface DailyMetrics {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
  pending: number;
  progress: number;
}

function getCurrentShiftName(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "Abertura";
  if (h >= 11 && h < 17) return "Tarde";
  return "Fechamento";
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function deriveStatus(
  executionStatus: string | null,
  startTime: string,
  maxDuration: number,
  completedAt: string | null,
): DailyTaskStatus {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const deadline = addMinutesToTime(startTime, maxDuration);

  if (executionStatus === "concluido") {
    // Check if it was completed after deadline
    if (completedAt) {
      const compDate = new Date(completedAt);
      const compHhmm = `${String(compDate.getHours()).padStart(2, "0")}:${String(compDate.getMinutes()).padStart(2, "0")}`;
      if (compHhmm > deadline) return "done_late";
    }
    return "done";
  }
  if (executionStatus === "cancelado") return "skipped";
  if (executionStatus === "em_andamento") {
    if (hhmm > deadline) return "overdue";
    return "in_progress";
  }
  // No execution yet
  if (hhmm > deadline) return "overdue";
  return "pending";
}

export function useDailyTasks() {
  const { visibleUserId } = useEstablishmentId();
  const qc = useQueryClient();
  const prevOverdueIds = useRef<Set<string>>(new Set());

  const todayStr = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay();

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["daily-tasks", visibleUserId, todayStr],
    queryFn: async (): Promise<DailyTask[]> => {
      if (!visibleUserId) return [];

      // Fetch active schedules for today's day of week
      const { data: schedules, error: schedErr } = await supabase
        .from("checklist_schedules")
        .select("*, checklists(id, name, sector, color), checklist_operators(id, name)")
        .eq("user_id", visibleUserId)
        .eq("is_active", true);
      if (schedErr) throw schedErr;

      const todaySchedules = (schedules || []).filter((s: any) => {
        const days = (s.days_of_week as number[]) || [];
        return days.includes(dayOfWeek);
      });

      if (todaySchedules.length === 0) return [];

      // Fetch today's executions
      const { data: executions, error: execErr } = await supabase
        .from("checklist_executions")
        .select("*, checklist_execution_items(id, completed_at)")
        .eq("user_id", visibleUserId)
        .eq("execution_date", todayStr);
      if (execErr) throw execErr;

      // Check which checklists have critical items
      const checklistIds = [...new Set(todaySchedules.map((s: any) => s.checklist_id))];
      const { data: criticalItems } = await supabase
        .from("checklist_items")
        .select("checklist_id")
        .in("checklist_id", checklistIds)
        .eq("is_critical", true);
      const criticalChecklistIds = new Set((criticalItems || []).map((i: any) => i.checklist_id));

      // Count total items per checklist
      const { data: itemCounts } = await supabase
        .from("checklist_items")
        .select("checklist_id")
        .in("checklist_id", checklistIds);
      const countMap: Record<string, number> = {};
      (itemCounts || []).forEach((i: any) => {
        countMap[i.checklist_id] = (countMap[i.checklist_id] || 0) + 1;
      });

      return todaySchedules.map((s: any) => {
        const exec = (executions || []).find(
          (e: any) => e.schedule_id === s.id || (e.checklist_id === s.checklist_id && !e.schedule_id)
        );
        const completedItems = exec
          ? (exec.checklist_execution_items || []).filter((i: any) => i.completed_at).length
          : 0;
        const totalItems = countMap[s.checklist_id] || 0;
        const deadline = addMinutesToTime(s.start_time, s.max_duration_minutes);

        return {
          id: exec?.id || s.id,
          scheduleId: s.id,
          checklistId: s.checklist_id,
          checklistName: s.checklists?.name || "Checklist",
          checklistColor: s.checklists?.color || null,
          sector: s.checklists?.sector || "cozinha",
          shift: s.shift || "Abertura",
          startTime: s.start_time,
          maxDurationMinutes: s.max_duration_minutes,
          deadlineTime: deadline,
          assignedOperatorId: s.assigned_operator_id,
          assignedOperatorName: s.checklist_operators?.name || null,
          assignedSector: s.assigned_sector,
          executionId: exec?.id || null,
          executionStatus: exec?.status || null,
          startedAt: exec?.started_at || null,
          completedAt: exec?.completed_at || null,
          score: exec?.score || null,
          status: deriveStatus(exec?.status || null, s.start_time, s.max_duration_minutes, exec?.completed_at || null),
          hasCriticalItems: criticalChecklistIds.has(s.checklist_id),
          totalItems,
          completedItems,
        };
      });
    },
    enabled: !!visibleUserId,
    refetchInterval: 30000,
  });

  // Toast when new tasks become overdue
  useEffect(() => {
    const currentOverdue = new Set(tasks.filter(t => t.status === "overdue").map(t => t.scheduleId));
    currentOverdue.forEach(id => {
      if (!prevOverdueIds.current.has(id)) {
        const task = tasks.find(t => t.scheduleId === id);
        if (task) toast.error(`⚠️ "${task.checklistName}" está atrasada!`);
      }
    });
    prevOverdueIds.current = currentOverdue;
  }, [tasks]);

  const metrics: DailyMetrics = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "done" || t.status === "done_late").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    overdue: tasks.filter(t => t.status === "overdue").length,
    pending: tasks.filter(t => t.status === "pending").length,
    progress: tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === "done" || t.status === "done_late").length / tasks.length) * 100)
      : 0,
  };

  const reassignOperator = useMutation({
    mutationFn: async ({ scheduleId, operatorId }: { scheduleId: string; operatorId: string }) => {
      const { error } = await supabase
        .from("checklist_schedules")
        .update({ assigned_operator_id: operatorId })
        .eq("id", scheduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-tasks"] });
      toast.success("Responsável atualizado");
    },
  });

  return {
    tasks,
    metrics,
    isLoading,
    refetch,
    currentShift: getCurrentShiftName(),
    reassignOperator: reassignOperator.mutate,
  };
}
