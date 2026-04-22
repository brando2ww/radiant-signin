import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PDVProduct } from "@/hooks/use-pdv-products";

export interface PDVOptionItemRecipeRef {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient_name?: string;
  ingredient_unit?: string;
}

export interface PDVProductOptionItem {
  id: string;
  option_id: string;
  name: string;
  price_adjustment: number;
  is_available: boolean;
  order_position: number;
  linked_product_id?: string | null;
  linked_product?: PDVProduct | null;
  recipes?: PDVOptionItemRecipeRef[];
}

export interface PDVProductOption {
  id: string;
  product_id: string;
  name: string;
  type: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  order_position: number;
  items: PDVProductOptionItem[];
}

export function usePDVProductOptions(productId?: string) {
  const queryClient = useQueryClient();

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["pdv-product-options", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data: opts, error: optsError } = await supabase
        .from("pdv_product_options")
        .select("*")
        .eq("product_id", productId!)
        .order("order_position");

      if (optsError) throw optsError;

      const optionIds = opts.map((o: any) => o.id);
      if (optionIds.length === 0) return [];

      const { data: items, error: itemsError } = await supabase
        .from("pdv_product_option_items")
        .select("*, linked_product:pdv_products(*)")
        .in("option_id", optionIds)
        .order("order_position");

      if (itemsError) throw itemsError;

      return opts.map((o: any) => ({
        ...o,
        items: (items || []).filter((i: any) => i.option_id === o.id),
      })) as PDVProductOption[];
    },
  });

  const createOption = useMutation({
    mutationFn: async (data: { product_id: string; name: string; type?: string; is_required?: boolean; min_selections?: number; max_selections?: number }) => {
      const { data: result, error } = await supabase
        .from("pdv_product_options")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-product-options", productId] });
      toast.success("Opção criada");
    },
    onError: () => toast.error("Erro ao criar opção"),
  });

  const updateOption = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; type?: string; is_required?: boolean; min_selections?: number; max_selections?: number }) => {
      const { error } = await supabase
        .from("pdv_product_options")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-product-options", productId] });
    },
    onError: () => toast.error("Erro ao atualizar opção"),
  });

  const deleteOption = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_product_options")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-product-options", productId] });
      toast.success("Opção removida");
    },
    onError: () => toast.error("Erro ao remover opção"),
  });

  const createItem = useMutation({
    mutationFn: async (data: { option_id: string; name: string; price_adjustment?: number; linked_product_id?: string | null }) => {
      const { data: result, error } = await supabase
        .from("pdv_product_option_items")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-product-options", productId] });
    },
    onError: () => toast.error("Erro ao criar item"),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; price_adjustment?: number; is_available?: boolean; linked_product_id?: string | null }) => {
      const { error } = await supabase
        .from("pdv_product_option_items")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-product-options", productId] });
    },
    onError: () => toast.error("Erro ao atualizar item"),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_product_option_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-product-options", productId] });
    },
    onError: () => toast.error("Erro ao remover item"),
  });

  return {
    options,
    isLoading,
    createOption,
    updateOption,
    deleteOption,
    createItem,
    updateItem,
    deleteItem,
  };
}

// Hook to fetch options for a product (used in AddItemDialog)
export function usePDVProductOptionsForOrder(productId?: string) {
  return useQuery({
    queryKey: ["pdv-product-options", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data: opts, error: optsError } = await supabase
        .from("pdv_product_options")
        .select("*")
        .eq("product_id", productId!)
        .order("order_position");

      if (optsError) throw optsError;

      const optionIds = opts.map((o: any) => o.id);
      if (optionIds.length === 0) return [];

      const { data: items, error: itemsError } = await supabase
        .from("pdv_product_option_items")
        .select("*, linked_product:pdv_products(*)")
        .in("option_id", optionIds)
        .eq("is_available", true)
        .order("order_position");

      if (itemsError) throw itemsError;

      return opts.map((o: any) => ({
        ...o,
        items: (items || []).filter((i: any) => i.option_id === o.id),
      })) as PDVProductOption[];
    },
  });
}
