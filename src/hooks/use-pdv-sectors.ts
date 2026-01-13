import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVSector {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

export function usePDVSectors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sectors, isLoading } = useQuery({
    queryKey: ["pdv-sectors", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_sectors")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as PDVSector[];
    },
    enabled: !!user,
  });

  // Query para setores deletados (lixeira)
  const { data: deletedSectors, isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["pdv-sectors-deleted", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_sectors")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PDVSector[];
    },
    enabled: !!user,
  });

  const createSector = useMutation({
    mutationFn: async (data: { name: string; color?: string; position_x?: number; position_y?: number; width?: number; height?: number }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: result, error } = await supabase
        .from("pdv_sectors")
        .insert({ 
          name: data.name, 
          color: data.color || '#6366f1',
          position_x: data.position_x ?? 0,
          position_y: data.position_y ?? 0,
          width: data.width ?? 300,
          height: data.height ?? 200,
          user_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors"] });
      toast.success("Setor criado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar setor: " + error.message);
    },
  });

  const updateSector = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<PDVSector, 'id' | 'user_id' | 'created_at'>> }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pdv_sectors")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    // Optimistic update - atualiza cache ANTES da requisição
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["pdv-sectors", user?.id] });
      
      const previousSectors = queryClient.getQueryData<PDVSector[]>(["pdv-sectors", user?.id]);
      
      queryClient.setQueryData<PDVSector[]>(["pdv-sectors", user?.id], (old) => {
        if (!old) return old;
        return old.map(sector => 
          sector.id === id ? { ...sector, ...updates } : sector
        );
      });
      
      return { previousSectors };
    },
    onError: (error: any, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousSectors) {
        queryClient.setQueryData(["pdv-sectors", user?.id], context.previousSectors);
      }
      toast.error("Erro ao atualizar setor: " + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors"] });
    },
  });

  const deleteSector = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pdv_sectors")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors-deleted"] });
      toast.success("Setor movido para a lixeira");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover setor: " + error.message);
    },
  });

  const restoreSector = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pdv_sectors")
        .update({ is_active: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors-deleted"] });
      toast.success("Setor restaurado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao restaurar setor: " + error.message);
    },
  });

  const permanentDeleteSector = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pdv_sectors")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors-deleted"] });
      toast.success("Setor excluído permanentemente");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir setor: " + error.message);
    },
  });

  return {
    sectors: sectors || [],
    isLoading,
    deletedSectors: deletedSectors || [],
    isLoadingDeleted,
    createSector: createSector.mutateAsync,
    isCreating: createSector.isPending,
    updateSector: updateSector.mutateAsync,
    isUpdating: updateSector.isPending,
    deleteSector: deleteSector.mutateAsync,
    isDeleting: deleteSector.isPending,
    restoreSector: restoreSector.mutate,
    isRestoring: restoreSector.isPending,
    permanentDeleteSector: permanentDeleteSector.mutate,
    isPermanentDeleting: permanentDeleteSector.isPending,
  };
}
