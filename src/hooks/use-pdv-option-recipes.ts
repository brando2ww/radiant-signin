import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PDVOptionItemRecipe {
  id: string;
  option_item_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient_name?: string;
  ingredient_unit?: string;
}

/**
 * Hook to manage ingredient links for one or many product option items.
 * If `optionItemIds` is provided, fetches recipes for all of them in one query.
 */
export function usePDVOptionRecipes(optionItemIds?: string[]) {
  const queryClient = useQueryClient();
  const ids = optionItemIds && optionItemIds.length > 0 ? optionItemIds : null;

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["pdv-option-recipes", ids?.slice().sort().join(",") || "none"],
    enabled: !!ids,
    queryFn: async (): Promise<PDVOptionItemRecipe[]> => {
      if (!ids) return [];
      const { data, error } = await supabase
        .from("pdv_option_item_recipes")
        .select("*")
        .in("option_item_id", ids);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const ingIds = Array.from(new Set(data.map((r: any) => r.ingredient_id)));
      const { data: ings } = await supabase
        .from("pdv_ingredients")
        .select("id, name, unit")
        .in("id", ingIds);
      const map = new Map((ings || []).map((i: any) => [i.id, i]));

      return data.map((r: any) => {
        const ing = map.get(r.ingredient_id);
        return {
          id: r.id,
          option_item_id: r.option_item_id,
          ingredient_id: r.ingredient_id,
          quantity: Number(r.quantity),
          unit: r.unit,
          ingredient_name: ing?.name,
          ingredient_unit: ing?.unit,
        } as PDVOptionItemRecipe;
      });
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pdv-option-recipes"] });
  };

  const upsertRecipe = useMutation({
    mutationFn: async ({
      optionItemId,
      ingredientId,
      quantity,
      unit,
    }: {
      optionItemId: string;
      ingredientId: string;
      quantity: number;
      unit?: string;
    }) => {
      const { data, error } = await supabase
        .from("pdv_option_item_recipes")
        .upsert(
          {
            option_item_id: optionItemId,
            ingredient_id: ingredientId,
            quantity,
            unit: unit || "un",
          },
          { onConflict: "option_item_id,ingredient_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
    onError: (err: any) => toast.error("Erro ao vincular insumo: " + err.message),
  });

  const removeRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_option_item_recipes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: any) => toast.error("Erro ao remover insumo: " + err.message),
  });

  const removeByOptionItem = useMutation({
    mutationFn: async (optionItemId: string) => {
      const { error } = await supabase
        .from("pdv_option_item_recipes")
        .delete()
        .eq("option_item_id", optionItemId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (err: any) => toast.error("Erro ao remover insumo: " + err.message),
  });

  return {
    recipes,
    isLoading,
    upsertRecipe: upsertRecipe.mutateAsync,
    removeRecipe: removeRecipe.mutateAsync,
    removeByOptionItem: removeByOptionItem.mutateAsync,
  };
}
