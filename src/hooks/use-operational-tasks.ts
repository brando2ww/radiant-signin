import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface ShiftConfig {
  name: string;
  start: string;
  end: string;
}

export interface TaskTemplate {
  id: string;
  userId: string;
  title: string;
  description?: string;
  shift: string;
  assignedTo?: string;
  requiresPhoto: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface TaskInstance {
  id: string;
  templateId?: string;
  userId: string;
  taskDate: string;
  title: string;
  description?: string;
  shift: string;
  assignedTo?: string;
  requiresPhoto: boolean;
  status: "pending" | "done" | "skipped";
  completedBy?: string;
  completedAt?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface TaskSettings {
  id: string;
  userId: string;
  shifts: ShiftConfig[];
  autoGenerate: boolean;
  qrCodeEnabled: boolean;
}

const DEFAULT_SHIFTS: ShiftConfig[] = [
  { name: "Abertura", start: "06:00", end: "11:00" },
  { name: "Tarde", start: "11:00", end: "17:00" },
  { name: "Fechamento", start: "17:00", end: "23:00" },
];

export function useOperationalTasks(selectedDate?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = selectedDate || new Date().toISOString().split("T")[0];

  // Templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["task-templates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operational_task_templates")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        title: t.title,
        description: t.description,
        shift: t.shift,
        assignedTo: t.assigned_to,
        requiresPhoto: t.requires_photo,
        sortOrder: t.sort_order,
        isActive: t.is_active,
        createdAt: t.created_at,
      })) as TaskTemplate[];
    },
    enabled: !!user?.id,
  });

  // Instances for selected date
  const { data: instances = [], isLoading: loadingInstances, refetch: refetchInstances } = useQuery({
    queryKey: ["task-instances", user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operational_task_instances")
        .select("*")
        .eq("user_id", user!.id)
        .eq("task_date", today)
        .order("shift")
        .order("title");
      if (error) throw error;
      return (data || []).map(mapInstance);
    },
    enabled: !!user?.id,
  });

  // Settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["task-settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operational_task_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return { id: "", userId: user!.id, shifts: DEFAULT_SHIFTS, autoGenerate: true, qrCodeEnabled: true } as TaskSettings;
      return {
        id: data.id,
        userId: data.user_id,
        shifts: (data.shifts as any) || DEFAULT_SHIFTS,
        autoGenerate: data.auto_generate,
        qrCodeEnabled: data.qr_code_enabled,
      } as TaskSettings;
    },
    enabled: !!user?.id,
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (t: Omit<TaskTemplate, "id" | "userId" | "createdAt">) => {
      const { error } = await supabase.from("operational_task_templates").insert({
        user_id: user!.id,
        title: t.title,
        description: t.description,
        shift: t.shift,
        assigned_to: t.assignedTo,
        requires_photo: t.requiresPhoto,
        sort_order: t.sortOrder,
        is_active: t.isActive,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Tarefa criada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...t }: Partial<TaskTemplate> & { id: string }) => {
      const { error } = await supabase.from("operational_task_templates").update({
        title: t.title,
        description: t.description,
        shift: t.shift,
        assigned_to: t.assignedTo,
        requires_photo: t.requiresPhoto,
        sort_order: t.sortOrder,
        is_active: t.isActive,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Tarefa atualizada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("operational_task_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Tarefa excluída" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Generate daily instances from templates
  const generateDaily = useMutation({
    mutationFn: async (date?: string) => {
      const targetDate = date || today;
      // Check if already generated
      const { count } = await supabase
        .from("operational_task_instances")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("task_date", targetDate);
      if ((count || 0) > 0) throw new Error("Tarefas do dia já foram geradas");

      const activeTemplates = templates.filter((t) => t.isActive);
      if (activeTemplates.length === 0) throw new Error("Nenhum template ativo encontrado");

      const rows = activeTemplates.map((t) => ({
        template_id: t.id,
        user_id: user!.id,
        task_date: targetDate,
        title: t.title,
        description: t.description,
        shift: t.shift,
        assigned_to: t.assignedTo,
        requires_photo: t.requiresPhoto,
        status: "pending",
      }));
      const { error } = await supabase.from("operational_task_instances").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-instances"] });
      toast({ title: "Tarefas do dia geradas!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Save settings
  const saveSettings = useMutation({
    mutationFn: async (s: Omit<TaskSettings, "id" | "userId">) => {
      const { error } = await supabase.from("operational_task_settings").upsert({
        user_id: user!.id,
        shifts: s.shifts as any,
        auto_generate: s.autoGenerate,
        qr_code_enabled: s.qrCodeEnabled,
      }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-settings"] });
      toast({ title: "Configurações salvas" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // History: fetch instances for a date range
  const fetchHistory = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from("operational_task_instances")
      .select("*")
      .eq("user_id", user!.id)
      .gte("task_date", startDate)
      .lte("task_date", endDate)
      .order("task_date", { ascending: false })
      .order("shift")
      .order("title");
    if (error) throw error;
    return (data || []).map(mapInstance);
  };

  return {
    templates,
    instances,
    settings: settings || { id: "", userId: "", shifts: DEFAULT_SHIFTS, autoGenerate: true, qrCodeEnabled: true },
    loadingTemplates,
    loadingInstances,
    loadingSettings,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    generateDaily: generateDaily.mutate,
    saveSettings: saveSettings.mutate,
    fetchHistory,
    refetchInstances,
    isGenerating: generateDaily.isPending,
  };
}

function mapInstance(row: any): TaskInstance {
  return {
    id: row.id,
    templateId: row.template_id,
    userId: row.user_id,
    taskDate: row.task_date,
    title: row.title,
    description: row.description,
    shift: row.shift,
    assignedTo: row.assigned_to,
    requiresPhoto: row.requires_photo,
    status: row.status,
    completedBy: row.completed_by,
    completedAt: row.completed_at,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdAt: row.created_at,
  };
}
