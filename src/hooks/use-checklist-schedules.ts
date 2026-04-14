import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ScheduleRow = Database["public"]["Tables"]["checklist_schedules"]["Row"];
type ScheduleInsert = Database["public"]["Tables"]["checklist_schedules"]["Insert"];

export function useChecklistSchedules() {
  const { visibleUserId } = useEstablishmentId();
  const qc = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["checklist-schedules", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const { data, error } = await supabase
        .from("checklist_schedules")
        .select("*, checklists(name, sector, color), checklist_operators(name)")
        .eq("user_id", visibleUserId)
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!visibleUserId,
  });

  const createSchedule = useMutation({
    mutationFn: async (input: Omit<ScheduleInsert, "user_id">) => {
      if (!visibleUserId) throw new Error("Sem usuário");
      const { error } = await supabase
        .from("checklist_schedules")
        .insert({ ...input, user_id: visibleUserId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-schedules"] });
      toast({ title: "Agendamento criado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduleRow> & { id: string }) => {
      const { error } = await supabase.from("checklist_schedules").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-schedules"] });
      toast({ title: "Agendamento atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-schedules"] });
      toast({ title: "Agendamento removido" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const duplicateSchedule = useMutation({
    mutationFn: async (id: string) => {
      const original = schedules.find((s: any) => s.id === id);
      if (!original || !visibleUserId) throw new Error("Não encontrado");
      const { checklists, checklist_operators, id: _id, created_at, updated_at, ...rest } = original as any;
      const { error } = await supabase
        .from("checklist_schedules")
        .insert({ ...rest, user_id: visibleUserId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-schedules"] });
      toast({ title: "Agendamento duplicado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const toggleSchedule = useMutation({
    mutationFn: async (id: string) => {
      const schedule = schedules.find((s: any) => s.id === id);
      if (!schedule) throw new Error("Não encontrado");
      const { error } = await supabase
        .from("checklist_schedules")
        .update({ is_active: !schedule.is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-schedules"] });
      toast({ title: "Status atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return {
    schedules,
    isLoading,
    createSchedule: createSchedule.mutateAsync,
    updateSchedule: updateSchedule.mutate,
    deleteSchedule: deleteSchedule.mutate,
    duplicateSchedule: duplicateSchedule.mutate,
    toggleSchedule: toggleSchedule.mutate,
  };
}
