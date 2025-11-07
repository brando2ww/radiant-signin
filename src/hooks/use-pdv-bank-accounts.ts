import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVBankAccount {
  id: string;
  user_id: string;
  name: string;
  bank_name: string | null;
  account_number: string | null;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePDVBankAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["pdv-bank-accounts", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as PDVBankAccount[];
    },
    enabled: !!user,
  });

  const createBankAccount = useMutation({
    mutationFn: async (bankAccount: Omit<PDVBankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_bank_accounts")
        .insert([{ ...bankAccount, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-bank-accounts"] });
      toast.success("Conta bancária criada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar conta bancária: " + error.message);
    },
  });

  return {
    bankAccounts: bankAccounts || [],
    isLoading,
    createBankAccount: createBankAccount.mutateAsync,
    isCreating: createBankAccount.isPending,
  };
}
