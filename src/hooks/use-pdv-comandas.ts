import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { resolveProductionCenterId } from "@/utils/resolveProductionCenter";
import { expandComposition } from "@/utils/expandComposition";
import { toast } from "sonner";

export type ComandaStatus =
  | "aberta"
  | "aguardando_pagamento"
  | "em_cobranca"
  | "fechada"
  | "cancelada";
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
  closed_by_waiter_at?: string | null;
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
  production_center_id: string | null;
}

export function usePDVComandas() {
  const { user } = useAuth();
  const { visibleUserId } = useEstablishmentId();
  const queryClient = useQueryClient();

  // Fetch all comandas
  const { data: comandas = [], isLoading: isLoadingComandas } = useQuery({
    queryKey: ["pdv-comandas", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const { data, error } = await supabase
        .from("pdv_comandas")
        .select("*")
        .eq("user_id", visibleUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comanda[];
    },
    enabled: !!visibleUserId,
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
    const ownerId = visibleUserId || user?.id;

    const { count } = await supabase
      .from("pdv_comandas")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ownerId)
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
      const ownerId = visibleUserId || user.id;

      // Idempotência: se for comanda padrão (sem customerName) vinculada a um
      // order, e já existir uma comanda padrão aberta, devolve a existente.
      // Evita duplicação por clique repetido / race / dois dispositivos.
      const isDefault = !data.customerName;
      if (data.orderId && isDefault) {
        const { data: existing } = await supabase
          .from("pdv_comandas")
          .select("*")
          .eq("order_id", data.orderId)
          .eq("status", "aberta")
          .is("customer_name", null)
          .maybeSingle();
        if (existing) return existing as Comanda;
      }

      const comandaNumber = await generateComandaNumber();

      const { data: newComanda, error } = await supabase
        .from("pdv_comandas")
        .insert({
          user_id: ownerId,
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

  // Close comanda — também libera a mesa se for a última comanda aberta da order
  const closeComandaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("pdv_comandas")
        .update({ status: "fechada", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      const closed = data as Comanda;

      // Se a comanda pertencia a uma order de mesa, verificar se foi a última
      if (closed.order_id) {
        const { count } = await supabase
          .from("pdv_comandas")
          .select("*", { count: "exact", head: true })
          .eq("order_id", closed.order_id)
          .eq("status", "aberta");

        if ((count ?? 0) === 0) {
          // Fecha a order e libera a mesa associada
          await supabase
            .from("pdv_orders")
            .update({ status: "fechada", updated_at: new Date().toISOString() })
            .eq("id", closed.order_id);

          await supabase
            .from("pdv_tables")
            .update({
              status: "livre",
              current_order_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("current_order_id", closed.order_id);
        }
      }

      return closed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
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
      const ownerId = visibleUserId || user?.id;
      const production_center_id = ownerId
        ? await resolveProductionCenterId(data.productId, ownerId)
        : null;

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
          production_center_id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Expandir produto composto: cria filhos invisíveis para roteamento de cozinha
      if (ownerId) {
        const children = await expandComposition(data.productId, data.quantity, ownerId);
        if (children.length > 0) {
          const missing = children.filter((c) => !c.production_center_id);
          if (missing.length > 0) {
            toast.warning(
              `${missing.length} sub-produto(s) sem centro de produção configurado e não serão impressos.`,
            );
          }
          const childRows = children.map((c) => ({
            comanda_id: data.comandaId,
            product_id: c.product_id,
            product_name: c.product_name,
            quantity: c.quantity,
            unit_price: 0,
            subtotal: 0,
            notes: null,
            kitchen_status: "pendente" as const,
            production_center_id: c.production_center_id,
            parent_item_id: (newItem as ComandaItem).id,
            is_composite_child: true,
          }));
          const { error: childError } = await supabase
            .from("pdv_comanda_items")
            .insert(childRows);
          if (childError) {
            // não bloqueia o pai, mas avisa
            toast.error("Erro ao expandir composição: " + childError.message);
          }
        }
      }

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

  // Send items to kitchen (also includes composite children) + enqueue print jobs
  const sendToKitchenMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      if (itemIds.length === 0) return;

      // Inclui filhos pendentes dos itens compostos selecionados
      const { data: childRows } = await supabase
        .from("pdv_comanda_items")
        .select("id")
        .in("parent_item_id", itemIds)
        .is("sent_to_kitchen_at", null);

      const allIds = Array.from(
        new Set([...itemIds, ...((childRows ?? []).map((r: any) => r.id))]),
      );

      const { error } = await supabase
        .from("pdv_comanda_items")
        .update({
          kitchen_status: "pendente",
          sent_to_kitchen_at: new Date().toISOString(),
        })
        .in("id", allIds);

      if (error) throw error;

      // Enfileira jobs de impressão (snapshot via view)
      const ownerId = visibleUserId || user?.id;
      if (!ownerId) return;

      const { data: viewRows, error: viewError } = await supabase
        .from("vw_print_bridge_comanda_items")
        .select("*")
        .in("id", allIds);

      if (viewError) {
        toast.error("Erro ao montar fila de impressão: " + viewError.message);
        return;
      }

      // Agrupa por (comanda + impressora/centro) para imprimir 1 papel por grupo
      const groups = new Map<string, any[]>();
      (viewRows ?? []).forEach((row: any) => {
        const groupKey = `${row.comanda_id ?? "nocomanda"}::${row.production_center_id ?? "nocenter"}::${row.printer_ip ?? "noip"}::${row.printer_port ?? 9100}`;
        const arr = groups.get(groupKey) || [];
        arr.push(row);
        groups.set(groupKey, arr);
      });

      const jobs = Array.from(groups.values()).map((rows) => {
        const first = rows[0];
        const hasPrinter = !!first.printer_ip;
        return {
          tenant_user_id: ownerId,
          source_kind: "comanda" as const,
          source_item_id: first.id, // representativo (1º item do grupo)
          center_id: first.production_center_id,
          center_name: first.center_name,
          printer_ip: first.printer_ip,
          printer_port: first.printer_port || 9100,
          payload: {
            comanda_number: first.comanda_number,
            customer_name: first.customer_name,
            kind: "comanda",
            items: rows.map((r: any) => ({
              product_name: r.product_name,
              quantity: r.quantity,
              notes: r.notes,
              modifiers: r.modifiers,
              parent_product_name: r.parent_product_name,
              is_composite_child: r.is_composite_child,
            })),
          },
          status: hasPrinter ? "pending" : "failed",
          error_message: hasPrinter ? null : "sem impressora configurada",
        };
      });

      if (jobs.length > 0) {
        const { error: jobsError } = await supabase
          .from("pdv_print_jobs")
          .insert(jobs);
        if (jobsError) {
          toast.error("Erro ao criar jobs de impressão: " + jobsError.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      toast.success("Itens enviados para cozinha!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar para cozinha: " + error.message);
    },
  });

  // Helper to get items for a specific comanda (only visible/parent items)
  const getItemsByComanda = (comandaId: string) => {
    return comandaItems.filter(
      (item) => item.comanda_id === comandaId && !(item as any).is_composite_child,
    );
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
