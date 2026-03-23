import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVCostCenter {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export function usePDVCostCenters() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: costCenters, isLoading } = useQuery({
    queryKey: ["pdv-cost-centers", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_cost_centers")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as PDVCostCenter[];
    },
    enabled: !!user,
  });

  const createCostCenter = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_cost_centers")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cost-centers"] });
      toast.success("Centro de custo criado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar centro de custo: " + error.message);
    },
  });

  const updateCostCenter = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pdv_cost_centers")
        .update({ name })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cost-centers"] });
      toast.success("Centro de custo atualizado");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  const deleteCostCenter = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pdv_cost_centers")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cost-centers"] });
      toast.success("Centro de custo excluído");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  return {
    costCenters: costCenters || [],
    isLoading,
    createCostCenter: createCostCenter.mutateAsync,
    isCreating: createCostCenter.isPending,
    updateCostCenter: updateCostCenter.mutateAsync,
    isUpdating: updateCostCenter.isPending,
    deleteCostCenter: deleteCostCenter.mutateAsync,
    isDeleting: deleteCostCenter.isPending,
  };
}
