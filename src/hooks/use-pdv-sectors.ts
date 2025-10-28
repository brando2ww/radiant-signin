import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVSector {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
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

  const createSector = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_sectors")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-sectors"] });
      toast.success("Setor criado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar setor: " + error.message);
    },
  });

  return {
    sectors: sectors || [],
    isLoading,
    createSector: createSector.mutateAsync,
    isCreating: createSector.isPending,
  };
}
