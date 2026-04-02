import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface OptionItemRecipeWithCost {
  id: string;
  option_item_id: string;
  ingredient_id: string;
  quantity: number;
  created_at: string;
  unit: string;
  ingredient_name: string;
  ingredient_unit: string;
  ingredient_unit_cost: number;
  total_cost: number;
}

export function useDeliveryOptionRecipes(optionItemId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["delivery-option-recipes", optionItemId, user?.id],
    queryFn: async (): Promise<OptionItemRecipeWithCost[]> => {
      if (!user || !optionItemId) return [];

      const { data, error } = await supabase
        .from("delivery_option_item_recipes")
        .select("*")
        .eq("option_item_id", optionItemId);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const ingredientIds = data.map(r => r.ingredient_id);
      const { data: ingredients } = await supabase
        .from("pdv_ingredients")
        .select("id, name, unit, unit_cost")
        .in("id", ingredientIds);

      const ingredientsMap = new Map(
        (ingredients || []).map(ing => [ing.id, ing])
      );

      return data.map(recipe => {
        const ingredient = ingredientsMap.get(recipe.ingredient_id);
        const quantity = Number(recipe.quantity);
        const unitCost = Number(ingredient?.unit_cost || 0);

        return {
          id: recipe.id,
          option_item_id: recipe.option_item_id,
          ingredient_id: recipe.ingredient_id,
          quantity,
          created_at: recipe.created_at,
          unit: recipe.unit,
          ingredient_name: ingredient?.name || "",
          ingredient_unit: ingredient?.unit || "",
          ingredient_unit_cost: unitCost,
          total_cost: quantity * unitCost,
        };
      });
    },
    enabled: !!user && !!optionItemId,
  });

  const addIngredient = useMutation({
    mutationFn: async ({ optionItemId, ingredientId, quantity }: { optionItemId: string; ingredientId: string; quantity: number }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("delivery_option_item_recipes")
        .insert({ option_item_id: optionItemId, ingredient_id: ingredientId, quantity, unit: "un" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-option-recipes", variables.optionItemId] });
      toast.success("Insumo adicionado ao adicional");
    },
    onError: (error: any) => toast.error("Erro ao adicionar insumo: " + error.message),
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("delivery_option_item_recipes")
        .update({ quantity })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-option-recipes", data.option_item_id] });
      toast.success("Quantidade atualizada");
    },
    onError: (error: any) => toast.error("Erro ao atualizar: " + error.message),
  });

  const removeIngredient = useMutation({
    mutationFn: async ({ id, optionItemId }: { id: string; optionItemId: string }) => {
      const { error } = await supabase.from("delivery_option_item_recipes").delete().eq("id", id);
      if (error) throw error;
      return { optionItemId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-option-recipes", data.optionItemId] });
      toast.success("Insumo removido");
    },
    onError: (error: any) => toast.error("Erro ao remover: " + error.message),
  });

  const calculateCMV = (list: OptionItemRecipeWithCost[] = recipes || []) =>
    list.reduce((total, r) => total + r.total_cost, 0);

  return {
    recipes: recipes || [],
    isLoading,
    addIngredient: addIngredient.mutate,
    isAdding: addIngredient.isPending,
    updateQuantity: updateQuantity.mutate,
    isUpdating: updateQuantity.isPending,
    removeIngredient: removeIngredient.mutate,
    isRemoving: removeIngredient.isPending,
    calculateCMV,
  };
}
