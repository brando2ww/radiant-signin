import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePDVUsers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["establishment-users", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("establishment_users")
        .select("*")
        .eq("establishment_owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createUser = useMutation({
    mutationFn: async (userData: {
      display_name: string;
      email: string;
      phone: string;
      role: string;
      password: string;
    }) => {
      if (!user?.id) throw new Error("Não autenticado");

      const { data, error } = await supabase.functions.invoke(
        "create-establishment-user",
        {
          body: {
            display_name: userData.display_name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            password: userData.password,
          },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["establishment-users"] });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (err: any) => {
      const msg = err.message || "Erro ao criar usuário";
      if (msg.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado no sistema.");
      } else {
        toast.error(msg);
      }
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...userData }: {
      id: string;
      display_name: string;
      email: string;
      phone: string;
      role: string;
    }) => {
      const { data, error } = await supabase
        .from("establishment_users")
        .update({
          display_name: userData.display_name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role as any,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["establishment-users"] });
      toast.success("Usuário atualizado!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("establishment_users")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["establishment-users"] });
      toast.success(vars.is_active ? "Usuário reativado" : "Usuário desativado");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao alterar status");
    },
  });

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    toggleActive,
  };
}
