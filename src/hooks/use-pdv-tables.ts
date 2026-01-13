import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PDVTableStatus = 
  | "livre" 
  | "ocupada" 
  | "aguardando_pedido" 
  | "aguardando_cozinha" 
  | "pediu_conta" 
  | "pendente_pagamento";

export interface PDVTable {
  id: string;
  user_id: string;
  table_number: string;
  capacity: number;
  status: PDVTableStatus;
  position_x: number | null;
  position_y: number | null;
  shape: string;
  current_order_id: string | null;
  merged_with: string | null;
  sector_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePDVTables() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tables, isLoading } = useQuery({
    queryKey: ["pdv-tables", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_tables")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("position_x", { ascending: true, nullsFirst: false })
        .order("table_number");

      if (error) throw error;
      return data as PDVTable[];
    },
    enabled: !!user,
  });

  const createTable = useMutation({
    mutationFn: async (table: Omit<PDVTable, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_tables")
        .insert({ ...table, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Mesa criada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar mesa: " + error.message);
    },
  });

  const updateTable = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PDVTable> }) => {
      const { data, error } = await supabase
        .from("pdv_tables")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["pdv-tables", user?.id] });
      
      // Snapshot previous value for rollback
      const previousTables = queryClient.getQueryData<PDVTable[]>(["pdv-tables", user?.id]);
      
      // Optimistically update the cache
      queryClient.setQueryData<PDVTable[]>(
        ["pdv-tables", user?.id],
        (old) => old?.map(table => 
          table.id === id ? { ...table, ...updates } : table
        ) ?? []
      );
      
      return { previousTables };
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousTables) {
        queryClient.setQueryData(["pdv-tables", user?.id], context.previousTables);
      }
      toast.error("Erro ao atualizar mesa: " + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
    },
  });

  const deleteTable = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - apenas marca como inativa
      const { error } = await supabase
        .from("pdv_tables")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Mesa removida com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover mesa: " + error.message);
    },
  });

  const mergeTables = useMutation({
    mutationFn: async ({ tableId1, tableId2 }: { tableId1: string; tableId2: string }) => {
      // Update both tables to reference each other
      const { error: error1 } = await supabase
        .from("pdv_tables")
        .update({ merged_with: tableId2 })
        .eq("id", tableId1);
      
      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from("pdv_tables")
        .update({ merged_with: tableId1 })
        .eq("id", tableId2);
      
      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Mesas unidas com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao unir mesas: " + error.message);
    },
  });

  const unmergeTables = useMutation({
    mutationFn: async (tableId: string) => {
      const table = tables?.find(t => t.id === tableId);
      if (!table?.merged_with) return;

      // Remove merge reference from both tables
      const { error: error1 } = await supabase
        .from("pdv_tables")
        .update({ merged_with: null })
        .eq("id", tableId);
      
      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from("pdv_tables")
        .update({ merged_with: null })
        .eq("id", table.merged_with);
      
      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Mesas separadas com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao separar mesas: " + error.message);
    },
  });

  return {
    tables: tables || [],
    isLoading,
    createTable: createTable.mutate,
    isCreating: createTable.isPending,
    updateTable: updateTable.mutate,
    isUpdating: updateTable.isPending,
    deleteTable: deleteTable.mutate,
    isDeleting: deleteTable.isPending,
    mergeTables: mergeTables.mutate,
    isMerging: mergeTables.isPending,
    unmergeTables: unmergeTables.mutate,
    isUnmerging: unmergeTables.isPending,
  };
}
