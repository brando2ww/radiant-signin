import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliveryProduct {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  promotional_price: number | null;
  preparation_time: number;
  serves: number;
  is_available: boolean;
  is_featured: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

export const useDeliveryProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ["delivery-products", categoryId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let query = supabase
        .from("delivery_products")
        .select("*")
        .eq("user_id", user.id);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query.order("order_position", { ascending: true });

      if (error) throw error;
      return data as DeliveryProduct[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      product: Omit<DeliveryProduct, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Auto-assign order_position as max+1 within the category if not set
      let orderPosition = product.order_position;
      if (!orderPosition || orderPosition === 0) {
        const { data: maxRow } = await supabase
          .from("delivery_products")
          .select("order_position")
          .eq("user_id", user.id)
          .eq("category_id", product.category_id)
          .order("order_position", { ascending: false })
          .limit(1)
          .maybeSingle();
        orderPosition = (maxRow?.order_position ?? 0) + 1;
      }

      const { data, error } = await supabase
        .from("delivery_products")
        .insert({ ...product, order_position: orderPosition, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar produto: " + error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DeliveryProduct>;
    }) => {
      const { data, error } = await supabase
        .from("delivery_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar produto: " + error.message);
    },
  });
};

export const useReorderProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; order_position: number }[]) => {
      const results = await Promise.all(
        items.map((item) =>
          supabase
            .from("delivery_products")
            .update({ order_position: item.order_position })
            .eq("id", item.id)
        )
      );
      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-products"] });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao reordenar produtos: " + error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("delivery_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-products"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir produto: " + error.message);
    },
  });
};
