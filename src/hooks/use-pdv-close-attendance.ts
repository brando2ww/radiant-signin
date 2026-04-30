import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePDVCloseAttendance() {
  const queryClient = useQueryClient();

  const closeAttendance = useMutation({
    mutationFn: async (input: {
      comandaId: string;
      closeWholeTable?: boolean;
      reason?: string | null;
    }) => {
      const { data, error } = await supabase.rpc("pdv_close_attendance", {
        p_comanda_id: input.comandaId,
        p_close_whole_table: input.closeWholeTable ?? false,
        p_reason: input.reason ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Atendimento encerrado. Aguardando cobrança no caixa.");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  return {
    closeAttendance: closeAttendance.mutateAsync,
    isClosing: closeAttendance.isPending,
  };
}
