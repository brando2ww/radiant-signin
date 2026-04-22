import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "sonner";

interface CashierSession {
  id: string;
  user_id: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  total_sales: number;
  total_cash: number;
  total_card: number;
  total_pix: number;
  total_withdrawals: number;
  notes: string | null;
}

interface CashMovement {
  id: string;
  cashier_session_id: string;
  type: "entrada" | "sangria" | "reforco" | "venda";
  amount: number;
  payment_method?: "dinheiro" | "cartao" | "pix";
  description: string | null;
  created_at: string;
}

export function usePDVCashier() {
  const { user } = useAuth();
  const { visibleUserId, isLoading: isLoadingEstablishment } = useEstablishmentId();
  const queryClient = useQueryClient();
  const isOwner = !!user?.id && !!visibleUserId && user.id === visibleUserId;

  // Buscar sessão ativa do caixa (do dono do estabelecimento — staff compartilha)
  const { data: activeSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ["pdv-cashier-active", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return null;

      const { data, error } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", visibleUserId)
        .is("closed_at", null)
        .order("opened_at", { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data as CashierSession | null;
    },
    enabled: !!visibleUserId && !isLoadingEstablishment,
  });

  // Buscar movimentações da sessão ativa
  const { data: movements = [], isLoading: isLoadingMovements } = useQuery({
    queryKey: ["pdv-cashier-movements", activeSession?.id],
    queryFn: async () => {
      if (!activeSession?.id) return [];

      const { data, error } = await supabase
        .from("pdv_cashier_movements")
        .select("*")
        .eq("cashier_session_id", activeSession.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashMovement[];
    },
    enabled: !!activeSession?.id,
  });

  // Abrir caixa
  const openCashier = useMutation({
    mutationFn: async ({ openingBalance }: { openingBalance: number }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      if (!isOwner) throw new Error("Apenas o responsável pelo estabelecimento pode abrir o caixa");

      const { data, error } = await supabase
        .from("pdv_cashier_sessions")
        .insert({
          user_id: user.id,
          opening_balance: openingBalance,
          total_sales: 0,
          total_cash: 0,
          total_card: 0,
          total_pix: 0,
          total_withdrawals: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      toast.success("Caixa aberto com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao abrir caixa:", error);
      toast.error("Erro ao abrir caixa");
    },
  });

  // Fechar caixa com sistema antifraude
  const closeCashier = useMutation({
    mutationFn: async ({
      sessionId,
      closingBalance,
      notes,
      expectedBalance,
      riskLevel,
    }: {
      sessionId: string;
      closingBalance: number;
      notes?: string;
      expectedBalance: number;
      riskLevel: "ok" | "low" | "medium" | "high" | "critical";
    }) => {
      const balanceDifference = closingBalance - expectedBalance;
      const differenceJustified = notes && notes.length >= 30;

      const { data, error } = await supabase
        .from("pdv_cashier_sessions")
        .update({
          closed_at: new Date().toISOString(),
          closing_balance: closingBalance,
          notes,
          expected_balance: expectedBalance,
          balance_difference: balanceDifference,
          difference_justified: differenceJustified,
          fraud_risk_level: riskLevel,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
      toast.success("Caixa fechado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao fechar caixa:", error);
      toast.error("Erro ao fechar caixa");
    },
  });

  // Adicionar movimentação (sangria/reforço)
  const addMovement = useMutation({
    mutationFn: async ({
      type,
      amount,
      description,
    }: {
      type: "sangria" | "reforco";
      amount: number;
      description?: string;
    }) => {
      if (!activeSession?.id) throw new Error("Nenhuma sessão de caixa ativa");

      // Inserir movimentação
      const { error: movError } = await supabase
        .from("pdv_cashier_movements")
        .insert({
          cashier_session_id: activeSession.id,
          type,
          amount,
          description,
        });

      if (movError) throw movError;

      // Atualizar totais da sessão
      const newWithdrawals =
        type === "sangria"
          ? activeSession.total_withdrawals + amount
          : activeSession.total_withdrawals - amount;

      const { error: updateError } = await supabase
        .from("pdv_cashier_sessions")
        .update({
          total_withdrawals: newWithdrawals,
        })
        .eq("id", activeSession.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
      toast.success("Movimentação registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar movimentação:", error);
      toast.error("Erro ao registrar movimentação");
    },
  });

  // Registrar venda
  const registerSale = useMutation({
    mutationFn: async ({
      orderId,
      amount,
      paymentMethod,
    }: {
      orderId: string;
      amount: number;
      paymentMethod: "dinheiro" | "cartao" | "pix";
    }) => {
      if (!activeSession?.id) throw new Error("Nenhuma sessão de caixa ativa");

      // Inserir movimentação
      const { error: movError } = await supabase
        .from("pdv_cashier_movements")
        .insert({
          cashier_session_id: activeSession.id,
          type: "venda",
          amount,
          payment_method: paymentMethod,
          description: `Pedido #${orderId}`,
        });

      if (movError) throw movError;

      // Atualizar totais da sessão
      const updates: any = {
        total_sales: activeSession.total_sales + amount,
      };

      if (paymentMethod === "dinheiro") {
        updates.total_cash = activeSession.total_cash + amount;
      } else if (paymentMethod === "cartao") {
        updates.total_card = activeSession.total_card + amount;
      } else if (paymentMethod === "pix") {
        updates.total_pix = activeSession.total_pix + amount;
      }

      const { error: updateError } = await supabase
        .from("pdv_cashier_sessions")
        .update(updates)
        .eq("id", activeSession.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
    },
    onError: (error) => {
      console.error("Erro ao registrar venda:", error);
      toast.error("Erro ao registrar venda");
    },
  });

  // Buscar última sessão fechada
  const { data: lastClosedSession } = useQuery({
    queryKey: ["pdv-cashier-last-closed", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("closed_at", "is", null)
        .order("closed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as CashierSession | null;
    },
    enabled: !!user?.id,
  });

  // Buscar movimentações da última sessão fechada
  const { data: lastClosedMovements = [] } = useQuery({
    queryKey: ["pdv-cashier-last-closed-movements", lastClosedSession?.id],
    queryFn: async () => {
      if (!lastClosedSession?.id) return [];

      const { data, error } = await supabase
        .from("pdv_cashier_movements")
        .select("*")
        .eq("cashier_session_id", lastClosedSession.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashMovement[];
    },
    enabled: !!lastClosedSession?.id,
  });

  const isLoading = isLoadingSession || isLoadingMovements;

  return {
    activeSession,
    movements,
    isLoading,
    openCashier: openCashier.mutate,
    isOpeningCashier: openCashier.isPending,
    closeCashier: closeCashier.mutate,
    isClosingCashier: closeCashier.isPending,
    addMovement: addMovement.mutate,
    isAddingMovement: addMovement.isPending,
    registerSale: registerSale.mutate,
    lastClosedSession,
    lastClosedMovements,
  };
}
