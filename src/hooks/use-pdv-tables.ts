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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar mesa: " + error.message);
    },
  });

  const deleteTable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_tables")
        .delete()
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

  return {
    tables: tables || [],
    isLoading,
    createTable: createTable.mutate,
    isCreating: createTable.isPending,
    updateTable: updateTable.mutate,
    isUpdating: updateTable.isPending,
    deleteTable: deleteTable.mutate,
    isDeleting: deleteTable.isPending,
  };
}
