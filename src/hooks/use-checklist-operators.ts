import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];
type OperatorInsert = Database["public"]["Tables"]["checklist_operators"]["Insert"];

export function useChecklistOperators() {
  const { visibleUserId } = useEstablishmentId();
  const qc = useQueryClient();

  const { data: operators = [], isLoading } = useQuery({
    queryKey: ["checklist-operators", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const { data, error } = await supabase
        .from("checklist_operators")
        .select("*")
        .eq("user_id", visibleUserId)
        .order("name");
      if (error) throw error;
      return data as OperatorRow[];
    },
    enabled: !!visibleUserId,
  });

  const createOperator = useMutation({
    mutationFn: async (input: Omit<OperatorInsert, "user_id">) => {
      if (!visibleUserId) throw new Error("Sem usuário");
      const { data, error } = await supabase
        .from("checklist_operators")
        .insert({ ...input, user_id: visibleUserId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-operators"] });
      toast({ title: "Colaborador cadastrado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateOperator = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OperatorRow> & { id: string }) => {
      const { error } = await supabase.from("checklist_operators").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-operators"] });
      toast({ title: "Colaborador atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteOperator = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_operators").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-operators"] });
      toast({ title: "Colaborador removido" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return {
    operators,
    isLoading,
    createOperator: createOperator.mutateAsync,
    updateOperator: updateOperator.mutate,
    deleteOperator: deleteOperator.mutate,
  };
}
