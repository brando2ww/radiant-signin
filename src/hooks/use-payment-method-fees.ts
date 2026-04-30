import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "sonner";

export interface PaymentMethodFee {
  id: string;
  user_id: string;
  method_key: string;
  label: string;
  fee_percentage: number;
  fee_fixed: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_PAYMENT_METHOD_FEES: Array<
  Pick<PaymentMethodFee, "method_key" | "label" | "fee_percentage" | "fee_fixed" | "is_active">
> = [
  { method_key: "cash", label: "Dinheiro", fee_percentage: 0, fee_fixed: 0, is_active: true },
  { method_key: "pix", label: "PIX", fee_percentage: 1, fee_fixed: 0, is_active: true },
  { method_key: "debit", label: "Débito", fee_percentage: 1, fee_fixed: 0, is_active: true },
  { method_key: "credit", label: "Crédito", fee_percentage: 3, fee_fixed: 0, is_active: true },
  { method_key: "ifood", label: "iFood", fee_percentage: 25, fee_fixed: 0, is_active: true },
];

const QUERY_KEY = "payment-method-fees";

export function usePaymentMethodFees() {
  const { visibleUserId, isLoading: loadingId } = useEstablishmentId();

  return useQuery({
    queryKey: [QUERY_KEY, visibleUserId],
    enabled: !!visibleUserId && !loadingId,
    queryFn: async (): Promise<PaymentMethodFee[]> => {
      if (!visibleUserId) return [];
      const { data, error } = await supabase
        .from("pdv_payment_method_fees")
        .select("*")
        .eq("user_id", visibleUserId)
        .order("label", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PaymentMethodFee[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

/** Hook auxiliar que garante seed dos métodos padrão na primeira vez. */
export function useSeedPaymentMethodFees() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sem usuário");
      const rows = DEFAULT_PAYMENT_METHOD_FEES.map((m) => ({ ...m, user_id: user.id }));
      const { error } = await supabase
        .from("pdv_payment_method_fees")
        .upsert(rows, { onConflict: "user_id,method_key", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpsertPaymentMethodFee() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Partial<PaymentMethodFee> & {
        method_key: string;
        label: string;
        fee_percentage: number;
        fee_fixed: number;
        is_active: boolean;
      },
    ) => {
      if (!user?.id) throw new Error("Sem usuário");
      const payload = {
        ...input,
        user_id: user.id,
      };
      const { data, error } = await supabase
        .from("pdv_payment_method_fees")
        .upsert(payload, { onConflict: "user_id,method_key" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Taxa salva");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar taxa"),
  });
}

export function useTogglePaymentMethodFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("pdv_payment_method_fees")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
    onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar status"),
  });
}

export function useDeletePaymentMethodFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pdv_payment_method_fees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Taxa removida");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao remover taxa"),
  });
}
