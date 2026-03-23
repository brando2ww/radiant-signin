import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const queryKey = ["pdv-chart-of-accounts", user?.id, accountType];

  const { data: accounts, isLoading } = useQuery({
    queryKey,
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pdv-chart-of-accounts"] });
  };

  const createAccount = useMutation({
    mutationFn: async (account: { code: string; name: string; account_type: string; parent_id?: string | null }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("pdv_chart_of_accounts")
        .insert({ ...account, user_id: user.id, parent_id: account.parent_id || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Conta criada com sucesso"); },
    onError: (e: any) => toast.error(e.message || "Erro ao criar conta"),
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; code?: string; name?: string; account_type?: string; parent_id?: string | null }) => {
      const { data, error } = await supabase
        .from("pdv_chart_of_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Conta atualizada"); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar conta"),
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_chart_of_accounts")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Conta removida"); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover conta"),
  });

  const seedBasicStructure = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      const seeds = [
        { code: "1.01", name: "Vendas Balcão", account_type: "receita" },
        { code: "1.02", name: "Vendas Delivery", account_type: "receita" },
        { code: "1.03", name: "Outras Receitas", account_type: "receita" },
        { code: "2.01", name: "Aluguel", account_type: "despesa" },
        { code: "2.02", name: "Energia", account_type: "despesa" },
        { code: "2.03", name: "Água", account_type: "despesa" },
        { code: "2.04", name: "Internet", account_type: "despesa" },
        { code: "2.05", name: "Salários", account_type: "despesa" },
        { code: "2.06", name: "Impostos", account_type: "despesa" },
        { code: "2.07", name: "Marketing", account_type: "despesa" },
        { code: "2.08", name: "Manutenção", account_type: "despesa" },
        { code: "2.09", name: "Outras Despesas", account_type: "despesa" },
        { code: "3.01", name: "Matéria-prima", account_type: "custo" },
        { code: "3.02", name: "Embalagens", account_type: "custo" },
        { code: "3.03", name: "Descartáveis", account_type: "custo" },
      ];
      const { error } = await supabase
        .from("pdv_chart_of_accounts")
        .insert(seeds.map(s => ({ ...s, user_id: user.id })));
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Estrutura básica criada com sucesso"); },
    onError: (e: any) => toast.error(e.message || "Erro ao criar estrutura básica"),
  });

  return {
    accounts: accounts || [],
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    seedBasicStructure,
  };
}
