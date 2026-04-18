import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PDVProduct } from "@/hooks/use-pdv-products";

export interface ProductComposition {
  id: string;
  parent_product_id: string;
  child_product_id: string;
  quantity: number;
  order_position: number;
  created_at: string;
  child_product?: PDVProduct;
}

export function useProductCompositions(productId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: compositions, isLoading } = useQuery({
    queryKey: ["pdv-compositions", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("pdv_product_compositions")
        .select("*, child_product:pdv_products!pdv_product_compositions_child_product_id_fkey(*)")
        .eq("parent_product_id", productId)
        .order("order_position");

      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        child_product: item.child_product as PDVProduct,
      })) as ProductComposition[];
    },
    enabled: !!productId,
  });

  const addComposition = useMutation({
    mutationFn: async ({
      parentProductId,
      childProductId,
      quantity = 1,
    }: {
      parentProductId: string;
      childProductId: string;
      quantity?: number;
    }) => {
      if (parentProductId === childProductId) {
        throw new Error("Um produto não pode ser sub-produto de si mesmo");
      }

      const maxPos = compositions?.length
        ? Math.max(...compositions.map((c) => c.order_position))
        : -1;

      const { data, error } = await supabase
        .from("pdv_product_compositions")
        .insert({
          parent_product_id: parentProductId,
          child_product_id: childProductId,
          quantity,
          order_position: maxPos + 1,
        })
        .select("*, child_product:pdv_products!pdv_product_compositions_child_product_id_fkey(*)")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-compositions", productId] });
      toast.success("Sub-produto adicionado");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate key")) {
        toast.error("Este sub-produto já está na composição");
      } else {
        toast.error("Erro ao adicionar: " + error.message);
      }
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from("pdv_product_compositions")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-compositions", productId] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar quantidade: " + error.message);
    },
  });

  const removeComposition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_product_compositions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-compositions", productId] });
      toast.success("Sub-produto removido");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  const calculateCompositionCost = (items?: ProductComposition[]) => {
    if (!items?.length) return 0;
    return items.reduce((sum, item) => {
      const price = item.child_product?.price_salon || 0;
      return sum + item.quantity * price;
    }, 0);
  };

  return {
    compositions: compositions || [],
    isLoading,
    addComposition: addComposition.mutate,
    isAdding: addComposition.isPending,
    updateQuantity: updateQuantity.mutate,
    removeComposition: removeComposition.mutate,
    isRemoving: removeComposition.isPending,
    calculateCompositionCost,
  };
}
