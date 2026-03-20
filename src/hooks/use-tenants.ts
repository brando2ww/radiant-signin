import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Tenant {
  id: string;
  name: string;
  document: string | null;
  owner_user_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TenantModule {
  id: string;
  tenant_id: string;
  module: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useTenants() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tenant[];
    },
    enabled: !!user?.id,
  });

  const createTenant = useMutation({
    mutationFn: async (payload: {
      name: string;
      document?: string;
      modules: string[];
      admin_email: string;
      admin_password: string;
      admin_name: string;
      admin_phone?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-tenant", {
        body: payload,
      });
      if (error) {
        const msg = data?.error || error.message;
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant criado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao criar tenant");
    },
  });

  const fetchTenantModules = async (tenantId: string): Promise<TenantModule[]> => {
    const { data, error } = await supabase
      .from("tenant_modules")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return data as TenantModule[];
  };

  const fetchTenantUsers = async (tenantId: string) => {
    const { data, error } = await supabase
      .from("establishment_users")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  };

  return { tenants, isLoading, createTenant, fetchTenantModules, fetchTenantUsers };
}
