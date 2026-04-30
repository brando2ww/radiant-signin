import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCancelNFCe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { emission_id: string; justificativa: string }) => {
      const { data, error } = await supabase.functions.invoke("cancel-nfce", { body: params });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Falha ao cancelar cupom");
      return data;
    },
    onSuccess: () => {
      toast.success("Cupom cancelado com sucesso");
      qc.invalidateQueries({ queryKey: ["fiscal-coupons"] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao cancelar cupom"),
  });
}

export function useCheckNFCeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { emission_id: string }) => {
      const { data, error } = await supabase.functions.invoke("check-nfce-status", { body: params });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) toast.success(`Status atualizado: ${data.status}`);
      else toast.error(data?.error || "Falha ao consultar status");
      qc.invalidateQueries({ queryKey: ["fiscal-coupons"] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao consultar status"),
  });
}

export function useResendNFCe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { emission_id: string }) => {
      const { data, error } = await supabase.functions.invoke("resend-nfce", { body: params });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) toast.success("Cupom reenviado com sucesso");
      else toast.error(data?.motivo || data?.error || "Falha ao reenviar cupom");
      qc.invalidateQueries({ queryKey: ["fiscal-coupons"] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao reenviar cupom"),
  });
}
