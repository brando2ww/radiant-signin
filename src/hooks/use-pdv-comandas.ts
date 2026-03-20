import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "sonner";

export type ComandaStatus = "aberta" | "fechada" | "cancelada";
export type KitchenStatus = "pendente" | "preparando" | "pronto" | "entregue";

export interface Comanda {
  id: string;
  user_id: string;
  order_id: string | null;
  comanda_number: string;
  customer_name: string | null;
  person_number: number | null;
  status: ComandaStatus;
  subtotal: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComandaItem {
  id: string;
  comanda_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  modifiers: Record<string, unknown> | null;
  kitchen_status: KitchenStatus;
  sent_to_kitchen_at: string | null;
  ready_at: string | null;
  created_at: string;
}

export function usePDVComandas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all comandas
  const { data: comandas = [], isLoading: isLoadingComandas } = useQuery({
    queryKey: ["pdv-comandas", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("pdv_comandas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comanda[];
    },
    enabled: !!user,
  });

  // Fetch all comanda items
  const { data: comandaItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["pdv-comanda-items", user?.id],
    queryFn: async () => {
      if (!user || comandas.length === 0) return [];
      const comandaIds = comandas.map((c) => c.id);
      const { data, error } = await supabase
        .from("pdv_comanda_items")
        .select("*")
        .in("comanda_id", comandaIds)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ComandaItem[];
    },
    enabled: !!user && comandas.length > 0,
  });

  // Generate next comanda number
  const generateComandaNumber = async (): Promise<string> => {
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    
    const { count } = await supabase
      .from("pdv_comandas")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id)
      .gte("created_at", today.toISOString().split("T")[0]);

    const nextNumber = (count || 0) + 1;
    return `${datePrefix}-${String(nextNumber).padStart(3, "0")}`;
  };

  // Create comanda
  const createComandaMutation = useMutation({
    mutationFn: async (data: {
      orderId?: string | null;
      customerName?: string;
      personNumber?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const comandaNumber = await generateComandaNumber();

      const { data: newComanda, error } = await supabase
        .from("pdv_comandas")
        .insert({
          user_id: user.id,
          order_id: data.orderId || null,
          comanda_number: comandaNumber,
          customer_name: data.customerName || null,
          person_number: data.personNumber || null,
          notes: data.notes || null,
          status: "aberta",
          subtotal: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return newComanda as Comanda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      toast.success("Comanda criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar comanda: " + error.message);
    },
  });

  // Update comanda
  const updateComandaMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Comanda> & { id: string }) => {
      const { data, error } = await supabase
        .from("pdv_comandas")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Comanda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar comanda: " + error.message);
    },
  });

  // Close comanda
  const closeComandaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("pdv_comandas")
        .update({ status: "fechada", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Comanda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      toast.success("Comanda fechada!");
    },
    onError: (error) => {
      toast.error("Erro ao fechar comanda: " + error.message);
    },
  });

  // Cancel comanda
  const cancelComandaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("pdv_comandas")
        .update({ status: "cancelada", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Comanda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      toast.success("Comanda cancelada!");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar comanda: " + error.message);
    },
  });

  // Add item to comanda
  const addItemMutation = useMutation({
    mutationFn: async (data: {
      comandaId: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }) => {
      const subtotal = data.quantity * data.unitPrice;

      const { data: newItem, error } = await supabase
        .from("pdv_comanda_items")
        .insert([{
          comanda_id: data.comandaId,
          product_id: data.productId,
          product_name: data.productName,
          quantity: data.quantity,
          unit_price: data.unitPrice,
          subtotal,
          notes: data.notes || null,
          kitchen_status: "pendente",
        }])
        .select()
        .single();

      if (error) throw error;
      return newItem as ComandaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      toast.success("Item adicionado!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar item: " + error.message);
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ComandaItem> & { id: string }) => {
      // Recalculate subtotal if quantity or unit_price changed
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const item = comandaItems.find((i) => i.id === id);
        if (item) {
          const quantity = updates.quantity ?? item.quantity;
          const unitPrice = updates.unit_price ?? item.unit_price;
          updateData.subtotal = quantity * unitPrice;
        }
      }

      const { data, error } = await supabase
        .from("pdv_comanda_items")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ComandaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar item: " + error.message);
    },
  });

  // Remove item
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_comanda_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      toast.success("Item removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover item: " + error.message);
    },
  });

  // Transfer item to another comanda
  const transferItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      targetComandaId,
    }: {
      itemId: string;
      targetComandaId: string;
    }) => {
      const { data, error } = await supabase
        .from("pdv_comanda_items")
        .update({ comanda_id: targetComandaId })
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return data as ComandaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      toast.success("Item transferido!");
    },
    onError: (error) => {
      toast.error("Erro ao transferir item: " + error.message);
    },
  });

  // Send items to kitchen
  const sendToKitchenMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const { error } = await supabase
        .from("pdv_comanda_items")
        .update({
          kitchen_status: "pendente",
          sent_to_kitchen_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      toast.success("Itens enviados para cozinha!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar para cozinha: " + error.message);
    },
  });

  // Helper to get items for a specific comanda
  const getItemsByComanda = (comandaId: string) => {
    return comandaItems.filter((item) => item.comanda_id === comandaId);
  };

  // Helper to get comandas for a specific order
  const getComandasByOrder = (orderId: string) => {
    return comandas.filter((c) => c.order_id === orderId);
  };

  // Helper to get standalone comandas (no order)
  const getStandaloneComandas = () => {
    return comandas.filter((c) => !c.order_id && c.status === "aberta");
  };

  return {
    comandas,
    comandaItems,
    isLoading: isLoadingComandas || isLoadingItems,

    // Mutations
    createComanda: createComandaMutation.mutateAsync,
    updateComanda: updateComandaMutation.mutate,
    closeComanda: closeComandaMutation.mutate,
    cancelComanda: cancelComandaMutation.mutate,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    transferItem: transferItemMutation.mutate,
    sendToKitchen: sendToKitchenMutation.mutate,

    // Pending states
    isCreating: createComandaMutation.isPending,
    isAddingItem: addItemMutation.isPending,

    // Helpers
    getItemsByComanda,
    getComandasByOrder,
    getStandaloneComandas,
  };
}
