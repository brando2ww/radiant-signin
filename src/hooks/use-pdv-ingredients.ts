import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVIngredient {
  id: string;
  user_id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_cost: number;
  supplier_id?: string | null;
  supplier?: {
    id: string;
    name: string;
  } | null;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

export function usePDVIngredients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ["pdv-ingredients", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_ingredients")
        .select(`
          *,
          supplier:pdv_suppliers(id, name)
        `)
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as PDVIngredient[];
    },
    enabled: !!user,
  });

  const createIngredient = useMutation({
    mutationFn: async (ingredient: Omit<PDVIngredient, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_ingredients")
        .insert({ ...ingredient, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-ingredients"] });
      toast.success("Insumo criado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar insumo: " + error.message);
    },
  });

  const updateIngredient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PDVIngredient> }) => {
      const { data, error } = await supabase
        .from("pdv_ingredients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-ingredients"] });
      toast.success("Insumo atualizado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar insumo: " + error.message);
    },
  });

  const deleteIngredient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_ingredients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-ingredients"] });
      toast.success("Insumo removido com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover insumo: " + error.message);
    },
  });

  const adjustStock = useMutation({
    mutationFn: async ({ id, adjustment, reason }: { id: string; adjustment: number; reason: string }) => {
      const ingredient = ingredients?.find(i => i.id === id);
      if (!ingredient) throw new Error("Insumo não encontrado");

      const newStock = ingredient.current_stock + adjustment;
      if (newStock < 0) throw new Error("Estoque não pode ser negativo");

      const { data, error } = await supabase
        .from("pdv_ingredients")
        .update({ current_stock: newStock })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-ingredients"] });
      toast.success("Estoque ajustado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao ajustar estoque: " + error.message);
    },
  });

  return {
    ingredients: ingredients || [],
    isLoading,
    createIngredient: createIngredient.mutate,
    isCreating: createIngredient.isPending,
    updateIngredient: updateIngredient.mutate,
    isUpdating: updateIngredient.isPending,
    deleteIngredient: deleteIngredient.mutate,
    isDeleting: deleteIngredient.isPending,
    adjustStock: adjustStock.mutate,
    isAdjusting: adjustStock.isPending,
  };
}
