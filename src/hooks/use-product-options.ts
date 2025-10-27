import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductOptionItem {
  id: string;
  option_id: string;
  name: string;
  price_adjustment: number;
  is_available: boolean;
  order_position: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  type: "single" | "multiple";
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  order_position: number;
  items?: ProductOptionItem[];
}

// Fetch options for a product
export const useProductOptions = (productId?: string) => {
  return useQuery({
    queryKey: ["product-options", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data: options, error: optionsError } = await supabase
        .from("delivery_product_options")
        .select("*")
        .eq("product_id", productId)
        .order("order_position");

      if (optionsError) throw optionsError;

      // Fetch items for each option
      const optionsWithItems = await Promise.all(
        options.map(async (option) => {
          const { data: items, error: itemsError } = await supabase
            .from("delivery_product_option_items")
            .select("*")
            .eq("option_id", option.id)
            .order("order_position");

          if (itemsError) throw itemsError;

          return {
            ...option,
            items: items || [],
          };
        })
      );

      return optionsWithItems as ProductOption[];
    },
    enabled: !!productId,
  });
};

// Create a new product option
export const useCreateProductOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: Omit<ProductOption, "id" | "items"> & { items: Omit<ProductOptionItem, "id" | "option_id">[] }) => {
      const { data: newOption, error: optionError } = await supabase
        .from("delivery_product_options")
        .insert({
          product_id: option.product_id,
          name: option.name,
          type: option.type,
          is_required: option.is_required,
          min_selections: option.min_selections,
          max_selections: option.max_selections,
          order_position: option.order_position,
        })
        .select()
        .single();

      if (optionError) throw optionError;

      // Insert items
      if (option.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("delivery_product_option_items")
          .insert(
            option.items.map((item, index) => ({
              option_id: newOption.id,
              name: item.name,
              price_adjustment: item.price_adjustment,
              is_available: item.is_available,
              order_position: index,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return newOption;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-options", variables.product_id] });
      toast.success("Opção criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar opção");
    },
  });
};

// Update a product option
export const useUpdateProductOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductOption> }) => {
      const { data, error } = await supabase
        .from("delivery_product_options")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["product-options", data.product_id] });
      toast.success("Opção atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar opção");
    },
  });
};

// Delete a product option
export const useDeleteProductOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      // First delete all items
      const { error: itemsError } = await supabase
        .from("delivery_product_option_items")
        .delete()
        .eq("option_id", id);

      if (itemsError) throw itemsError;

      // Then delete the option
      const { error } = await supabase
        .from("delivery_product_options")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["product-options", data.productId] });
      toast.success("Opção excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir opção");
    },
  });
};

// Create option item
export const useCreateOptionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ item, productId }: { item: Omit<ProductOptionItem, "id">; productId: string }) => {
      const { data, error } = await supabase
        .from("delivery_product_option_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return { data, productId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-options", result.productId] });
      toast.success("Item adicionado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar item");
    },
  });
};

// Update option item
export const useUpdateOptionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates, productId }: { id: string; updates: Partial<ProductOptionItem>; productId: string }) => {
      const { data, error } = await supabase
        .from("delivery_product_option_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, productId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-options", result.productId] });
      toast.success("Item atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar item");
    },
  });
};

// Delete option item
export const useDeleteOptionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from("delivery_product_option_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, productId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-options", result.productId] });
      toast.success("Item excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir item");
    },
  });
};
