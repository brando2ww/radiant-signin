import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DeliveryRecipeWithCost {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity: number;
  created_at: string;
  unit: string;
  ingredient_name: string;
  ingredient_unit: string;
  ingredient_unit_cost: number;
  total_cost: number;
}

export function useDeliveryRecipes(productId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["delivery-recipes", productId, user?.id],
    queryFn: async (): Promise<DeliveryRecipeWithCost[]> => {
      if (!user || !productId) return [];

      const { data, error } = await supabase
        .from("delivery_product_recipes")
        .select("*")
        .eq("product_id", productId);

      if (error) throw error;
      if (!data) return [];

      const ingredientIds = data.map(r => r.ingredient_id);
      if (ingredientIds.length === 0) return [];

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
          product_id: recipe.product_id,
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
    enabled: !!user && !!productId,
  });

  const addIngredient = useMutation({
    mutationFn: async ({ productId, ingredientId, quantity }: { productId: string; ingredientId: string; quantity: number }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("delivery_product_recipes")
        .insert({ product_id: productId, ingredient_id: ingredientId, quantity, unit: "un" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-recipes", variables.productId] });
      toast.success("Insumo adicionado à receita");
    },
    onError: (error: any) => toast.error("Erro ao adicionar insumo: " + error.message),
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("delivery_product_recipes")
        .update({ quantity })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-recipes", data.product_id] });
      toast.success("Quantidade atualizada");
    },
    onError: (error: any) => toast.error("Erro ao atualizar: " + error.message),
  });

  const removeIngredient = useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from("delivery_product_recipes").delete().eq("id", id);
      if (error) throw error;
      return { productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-recipes", data.productId] });
      toast.success("Insumo removido da receita");
    },
    onError: (error: any) => toast.error("Erro ao remover: " + error.message),
  });

  const calculateCMV = (list: DeliveryRecipeWithCost[] = recipes || []) =>
    list.reduce((total, r) => total + r.total_cost, 0);

  const calculateMargin = (price: number, cmv: number) =>
    price === 0 ? 0 : ((price - cmv) / price) * 100;

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
    calculateMargin,
  };
}
