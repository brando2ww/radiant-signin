import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PDVChartOfAccount {
  id: string;
  user_id: string;
  code: string;
  name: string;
  account_type: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePDVChartOfAccounts(accountType?: string) {
  const { user } = useAuth();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["pdv-chart-of-accounts", user?.id, accountType],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      let query = supabase
        .from("pdv_chart_of_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (accountType) {
        query = query.eq("account_type", accountType);
      }

      const { data, error } = await query.order("code");

      if (error) throw error;
      return data as PDVChartOfAccount[];
    },
    enabled: !!user,
  });

  return {
    accounts: accounts || [],
    isLoading,
  };
}
