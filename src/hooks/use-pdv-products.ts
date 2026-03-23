import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "sonner";

export interface PDVProduct {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  price_salon: number;
  price_balcao: number | null;
  price_delivery: number | null;
  preparation_time: number;
  serves: number;
  is_available: boolean;
  available_times: any;
  is_sold_by_weight: boolean;
  ncm: string | null;
  cest: string | null;
  cfop: string | null;
  origin: string | null;
  cst_icms: string | null;
  csosn: string | null;
  icms_rate: number | null;
  pis_cst: string | null;
  pis_rate: number | null;
  cofins_cst: string | null;
  cofins_rate: number | null;
  tax_unit: string | null;
  ean: string | null;
  created_at: string;
  updated_at: string;
}

export function usePDVProducts() {
  const { user } = useAuth();
  const { visibleUserId } = useEstablishmentId();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["pdv-products", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_products")
        .select("*")
        .eq("user_id", visibleUserId)
        .order("category")
        .order("name");

      if (error) throw error;
      return data as PDVProduct[];
    },
    enabled: !!visibleUserId,
  });

  const createProduct = useMutation({
    mutationFn: async (product: Omit<PDVProduct, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_products")
        .insert({ ...product, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-products"] });
      toast.success("Produto criado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar produto: " + error.message);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PDVProduct> }) => {
      const { data, error } = await supabase
        .from("pdv_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-products"] });
      toast.success("Produto atualizado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar produto: " + error.message);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-products"] });
      toast.success("Produto removido com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover produto: " + error.message);
    },
  });

  return {
    products: products || [],
    isLoading,
    createProduct: createProduct.mutate,
    isCreating: createProduct.isPending,
    updateProduct: updateProduct.mutate,
    isUpdating: updateProduct.isPending,
    deleteProduct: deleteProduct.mutate,
    isDeleting: deleteProduct.isPending,
  };
}
