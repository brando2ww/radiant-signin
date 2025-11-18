import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BankAccount {
  id: string;
  user_id: string;
  name: string;
  bank_name: string | null;
  agency: string | null;
  account_number: string | null;
  account_type: "checking" | "savings" | "investment";
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountMovement {
  id: string;
  user_id: string;
  bank_account_id: string;
  amount: number;
  type: "credit" | "debit" | "transfer";
  description: string | null;
  reference_type: "transaction" | "bill" | "transfer" | "manual" | null;
  reference_id: string | null;
  balance_after: number;
  created_at: string;
}

export function useBankAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["bank-accounts", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user,
  });

  const { data: totalBalance } = useQuery({
    queryKey: ["bank-accounts-total", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("current_balance")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      
      return data.reduce((sum, account) => sum + (account.current_balance || 0), 0);
    },
    enabled: !!user,
  });

  const createBankAccount = useMutation({
    mutationFn: async (bankAccount: Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_balance'>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("bank_accounts")
        .insert([{ 
          ...bankAccount, 
          user_id: user.id,
          current_balance: bankAccount.initial_balance 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-total"] });
      toast.success("Conta bancária criada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar conta bancária: " + error.message);
    },
  });

  const updateBankAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("bank_accounts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-total"] });
      toast.success("Conta bancária atualizada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar conta bancária: " + error.message);
    },
  });

  const deleteBankAccount = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Soft delete
      const { error } = await supabase
        .from("bank_accounts")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-total"] });
      toast.success("Conta bancária desativada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao desativar conta bancária: " + error.message);
    },
  });

  const transferBetweenAccounts = useMutation({
    mutationFn: async ({ 
      fromAccountId, 
      toAccountId, 
      amount, 
      description 
    }: { 
      fromAccountId: string; 
      toAccountId: string; 
      amount: number; 
      description?: string;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Get current balances
      const { data: fromAccount, error: fromError } = await supabase
        .from("bank_accounts")
        .select("current_balance")
        .eq("id", fromAccountId)
        .single();

      if (fromError) throw fromError;

      const { data: toAccount, error: toError } = await supabase
        .from("bank_accounts")
        .select("current_balance")
        .eq("id", toAccountId)
        .single();

      if (toError) throw toError;

      const newFromBalance = (fromAccount.current_balance || 0) - amount;
      const newToBalance = (toAccount.current_balance || 0) + amount;

      // Update balances
      const { error: updateFromError } = await supabase
        .from("bank_accounts")
        .update({ current_balance: newFromBalance })
        .eq("id", fromAccountId);

      if (updateFromError) throw updateFromError;

      const { error: updateToError } = await supabase
        .from("bank_accounts")
        .update({ current_balance: newToBalance })
        .eq("id", toAccountId);

      if (updateToError) throw updateToError;

      // Record movements
      const movementId = crypto.randomUUID();
      
      await supabase.from("account_movements").insert([
        {
          user_id: user.id,
          bank_account_id: fromAccountId,
          amount: -amount,
          type: "transfer",
          description: description || "Transferência",
          reference_type: "transfer",
          reference_id: movementId,
          balance_after: newFromBalance,
        },
        {
          user_id: user.id,
          bank_account_id: toAccountId,
          amount: amount,
          type: "transfer",
          description: description || "Transferência",
          reference_type: "transfer",
          reference_id: movementId,
          balance_after: newToBalance,
        },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts-total"] });
      queryClient.invalidateQueries({ queryKey: ["account-movements"] });
      toast.success("Transferência realizada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao realizar transferência: " + error.message);
    },
  });

  return {
    bankAccounts: bankAccounts || [],
    totalBalance: totalBalance || 0,
    isLoading,
    createBankAccount: createBankAccount.mutateAsync,
    updateBankAccount: updateBankAccount.mutateAsync,
    deleteBankAccount: deleteBankAccount.mutateAsync,
    transferBetweenAccounts: transferBetweenAccounts.mutateAsync,
    isCreating: createBankAccount.isPending,
    isUpdating: updateBankAccount.isPending,
    isDeleting: deleteBankAccount.isPending,
    isTransferring: transferBetweenAccounts.isPending,
  };
}

export function useAccountMovements(bankAccountId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["account-movements", user?.id, bankAccountId],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      let query = supabase
        .from("account_movements")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bankAccountId) {
        query = query.eq("bank_account_id", bankAccountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AccountMovement[];
    },
    enabled: !!user,
  });
}
