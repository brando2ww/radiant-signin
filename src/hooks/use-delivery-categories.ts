import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliveryCategory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDeliveryCategories = () => {
  return useQuery({
    queryKey: ["delivery-categories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("delivery_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as DeliveryCategory[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      category: Omit<DeliveryCategory, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("delivery_categories")
        .insert({ ...category, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-categories"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DeliveryCategory>;
    }) => {
      const { data, error } = await supabase
        .from("delivery_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-categories"] });
      toast.success("Categoria atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar categoria: " + error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("delivery_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-categories"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-products"] });
      toast.success("Categoria excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir categoria: " + error.message);
    },
  });
};
