import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "sonner";

interface KitchenItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  notes: string | null;
  kitchen_status: string;
  added_at: string;
  sent_to_kitchen_at: string | null;
  ready_at: string | null;
  order: {
    order_number: string;
    source: string;
    table_id: string | null;
    customer_name: string | null;
  };
}

export function usePDVKitchen() {
  const { user } = useAuth();
  const { visibleUserId } = useEstablishmentId();
  const queryClient = useQueryClient();

  // Buscar itens da cozinha
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pdv-kitchen-items", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];

      const { data, error } = await supabase
        .from("pdv_order_items")
        .select(`
          *,
          order:pdv_orders!inner(
            order_number,
            source,
            table_id,
            customer_name,
            user_id
          )
        `)
        .eq("order.user_id", visibleUserId)
        .in("kitchen_status", ["pendente", "preparando", "pronto"])
        .order("added_at", { ascending: true });

      if (error) throw error;
      return data as unknown as KitchenItem[];
    },
    enabled: !!visibleUserId,
    refetchInterval: 10000,
  });

  // Atualizar status do item
  const updateItemStatus = useMutation({
    mutationFn: async ({
      itemId,
      status,
    }: {
      itemId: string;
      status: "pendente" | "preparando" | "pronto" | "entregue";
    }) => {
      const updates: any = {
        kitchen_status: status,
      };

      // Registrar timestamps
      if (status === "preparando" && !items.find((i) => i.id === itemId)?.sent_to_kitchen_at) {
        updates.sent_to_kitchen_at = new Date().toISOString();
      } else if (status === "pronto") {
        updates.ready_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("pdv_order_items")
        .update(updates)
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-kitchen-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-orders"] });
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    },
  });

  // Marcar múltiplos itens como preparando
  const startMultipleItems = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const { error } = await supabase
        .from("pdv_order_items")
        .update({
          kitchen_status: "preparando",
          sent_to_kitchen_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-kitchen-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-orders"] });
      toast.success("Itens iniciados!");
    },
    onError: (error) => {
      console.error("Erro ao iniciar itens:", error);
      toast.error("Erro ao iniciar itens");
    },
  });

  // Marcar múltiplos itens como prontos
  const finishMultipleItems = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const { error } = await supabase
        .from("pdv_order_items")
        .update({
          kitchen_status: "pronto",
          ready_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-kitchen-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-orders"] });
      toast.success("Itens finalizados!");
    },
    onError: (error) => {
      console.error("Erro ao finalizar itens:", error);
      toast.error("Erro ao finalizar itens");
    },
  });

  return {
    items,
    isLoading,
    updateItemStatus: updateItemStatus.mutate,
    isUpdating: updateItemStatus.isPending,
    startMultipleItems: startMultipleItems.mutate,
    finishMultipleItems: finishMultipleItems.mutate,
  };
}
