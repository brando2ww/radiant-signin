import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface IngredientCategory {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export function useIngredientCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["ingredient-categories", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_ingredient_categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as IngredientCategory[];
    },
    enabled: !!user,
  });

  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_ingredient_categories")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient-categories"] });
      toast.success("Categoria criada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });

  return {
    categories: categories || [],
    isLoading,
    createCategory: createCategory.mutateAsync,
    isCreating: createCategory.isPending,
  };
}
