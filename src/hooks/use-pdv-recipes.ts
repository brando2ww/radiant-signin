import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ProductRecipe {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity: number;
  created_at: string;
  unit: string;
}

export interface RecipeWithCost {
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

export interface ProductCMV {
  product_id: string;
  total_cmv: number;
  ingredients: RecipeWithCost[];
}

export function usePDVRecipes(productId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["pdv-recipes", productId, user?.id],
    queryFn: async (): Promise<RecipeWithCost[]> => {
      if (!user || !productId) return [];

      const { data, error } = await supabase
        .from("pdv_product_recipes")
        .select("*")
        .eq("product_id", productId);

      if (error) throw error;
      if (!data) return [];

      // Fetch ingredients separately to avoid deep type issues
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
    mutationFn: async ({
      productId,
      ingredientId,
      quantity,
    }: {
      productId: string;
      ingredientId: string;
      quantity: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const insertData: any = {
        product_id: productId,
        ingredient_id: ingredientId,
        quantity: quantity,
        unit: "un",
      };

      const { data, error } = await supabase
        .from("pdv_product_recipes")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdv-recipes", variables.productId] });
      toast.success("Insumo adicionado à receita");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar insumo: " + error.message);
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("pdv_product_recipes")
        .update({ quantity })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pdv-recipes", data.product_id] });
      toast.success("Quantidade atualizada");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar quantidade: " + error.message);
    },
  });

  const removeIngredient = useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from("pdv_product_recipes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pdv-recipes", data.productId] });
      toast.success("Insumo removido da receita");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover insumo: " + error.message);
    },
  });

  const calculateCMV = (recipesList: RecipeWithCost[] = recipes || []) => {
    return recipesList.reduce((total, recipe) => total + recipe.total_cost, 0);
  };

  const calculateMargin = (price: number, cmv: number) => {
    if (price === 0) return 0;
    return ((price - cmv) / price) * 100;
  };

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
