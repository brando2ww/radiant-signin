import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { startOfWeek, endOfWeek } from "date-fns";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category: 'payment' | 'meeting' | 'reconciliation' | 'administrative' | 'personal' | 'other';
  color: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  tags?: string[];
  relatedTransactionId?: string;
  relatedBillId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FilterState {
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
  weekStart?: Date;
}

export function useTasks(filters?: FilterState) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchTasks = async (): Promise<Task[]> => {
    if (!user?.id) return [];

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    // Apply date range filter (default to current week)
    const weekStart = filters?.weekStart || startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    
    query = query
      .gte("start_time", weekStart.toISOString())
      .lte("start_time", weekEnd.toISOString());

    // Apply other filters
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order("start_time", { ascending: true });

    if (error) throw error;

    return (data || []).map((task) => ({
      id: task.id,
      userId: task.user_id,
      title: task.title,
      description: task.description || undefined,
      startTime: new Date(task.start_time),
      endTime: new Date(task.end_time),
      category: task.category as Task['category'],
      color: task.color,
      status: task.status as Task['status'],
      priority: task.priority as Task['priority'],
      location: task.location || undefined,
      tags: task.tags || undefined,
      relatedTransactionId: task.related_transaction_id || undefined,
      relatedBillId: task.related_bill_id || undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
    }));
  };

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks", user?.id, filters],
    queryFn: fetchTasks,
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: newTask.title,
          description: newTask.description,
          start_time: newTask.startTime.toISOString(),
          end_time: newTask.endTime.toISOString(),
          category: newTask.category,
          color: newTask.color,
          status: newTask.status,
          priority: newTask.priority,
          location: newTask.location,
          tags: newTask.tags,
          related_transaction_id: newTask.relatedTransactionId,
          related_bill_id: newTask.relatedBillId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: updates.title,
          description: updates.description,
          start_time: updates.startTime?.toISOString(),
          end_time: updates.endTime?.toISOString(),
          category: updates.category,
          color: updates.color,
          status: updates.status,
          priority: updates.priority,
          location: updates.location,
          tags: updates.tags,
          related_transaction_id: updates.relatedTransactionId,
          related_bill_id: updates.relatedBillId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    isLoading,
    refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
