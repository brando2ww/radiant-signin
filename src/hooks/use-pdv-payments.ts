import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PaymentMethod = "dinheiro" | "cartao" | "pix";

interface RegisterPaymentParams {
  comandaId: string;
  orderId?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeAmount?: number;
  installments?: number;
  notes?: string;
  discountAmount?: number;
  discountReason?: string;
  discountAuthorizedBy?: string;
}

export function usePDVPayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Register payment and close comanda
  const registerPayment = useMutation({
    mutationFn: async ({
      comandaId,
      orderId,
      amount,
      paymentMethod,
      cashReceived,
      changeAmount,
      installments,
      discountReason,
      discountAuthorizedBy,
    }: RegisterPaymentParams) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // 1. Close the comanda (only if still open)
      const { data: updatedComandas, error: comandaError } = await supabase
        .from("pdv_comandas")
        .update({
          status: "fechada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", comandaId)
        .eq("status", "aberta")
        .select();

      if (comandaError) throw comandaError;
      if (!updatedComandas || updatedComandas.length === 0) {
        throw new Error("Comanda já finalizada");
      }

      // 2. If there's an order_id, insert payment record
      if (orderId) {
        const { error: paymentError } = await supabase
          .from("pdv_payments")
          .insert({
            order_id: orderId,
            payment_method: paymentMethod,
            amount,
            cash_received: cashReceived || null,
            change_amount: changeAmount || null,
            installments: installments || 1,
          });

        if (paymentError) {
          console.error("Payment insert error:", paymentError);
          // Don't throw - comanda was already closed
        }
      }

      // 3. Register sale in cashier (if cashier is open)
      const { data: activeSession } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", user.id)
        .is("closed_at", null)
        .maybeSingle();

      if (activeSession) {
        // Insert movement
        const movementData: any = {
          cashier_session_id: activeSession.id,
          type: "venda",
          amount,
          payment_method: paymentMethod,
          description: `Comanda #${comandaId.slice(0, 8)}`,
        };
        
        if (discountReason) movementData.discount_reason = discountReason;
        if (discountAuthorizedBy) movementData.discount_authorized_by = discountAuthorizedBy;
        
        await supabase.from("pdv_cashier_movements").insert(movementData);

        // Update session totals
        const updates: Record<string, number> = {
          total_sales: activeSession.total_sales + amount,
        };

        if (paymentMethod === "dinheiro") {
          updates.total_cash = activeSession.total_cash + amount;
        } else if (paymentMethod === "cartao") {
          updates.total_card = activeSession.total_card + amount;
        } else if (paymentMethod === "pix") {
          updates.total_pix = activeSession.total_pix + amount;
        }

        await supabase
          .from("pdv_cashier_sessions")
          .update(updates)
          .eq("id", activeSession.id);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Pagamento registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro ao registrar pagamento");
    },
  });

  // Register payment for a table (closes all comandas and frees table)
  const registerTablePayment = useMutation({
    mutationFn: async ({
      tableId,
      comandaIds,
      amount,
      paymentMethod,
      cashReceived,
      changeAmount,
      installments,
      discountReason,
      discountAuthorizedBy,
    }: {
      tableId: string;
      comandaIds: string[];
      amount: number;
      paymentMethod: PaymentMethod;
      cashReceived?: number;
      changeAmount?: number;
      installments?: number;
      discountReason?: string;
      discountAuthorizedBy?: string;
    }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // 1. Close all comandas for this table (only if still open)
      const { data: updatedComandas, error: comandaError } = await supabase
        .from("pdv_comandas")
        .update({
          status: "fechada",
          updated_at: new Date().toISOString(),
        })
        .in("id", comandaIds)
        .eq("status", "aberta")
        .select();

      if (comandaError) throw comandaError;
      if (!updatedComandas || updatedComandas.length === 0) {
        throw new Error("Comandas já finalizadas");
      }

      // 2. Free the table
      const { error: tableError } = await supabase
        .from("pdv_tables")
        .update({
          status: "livre",
          current_order_id: null,
        })
        .eq("id", tableId);

      if (tableError) throw tableError;

      // 3. Register sale in cashier
      const { data: activeSession } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", user.id)
        .is("closed_at", null)
        .maybeSingle();

      if (activeSession) {
        const movementData: any = {
          cashier_session_id: activeSession.id,
          type: "venda",
          amount,
          payment_method: paymentMethod,
          description: `Mesa #${tableId.slice(0, 8)}`,
        };
        
        if (discountReason) movementData.discount_reason = discountReason;
        if (discountAuthorizedBy) movementData.discount_authorized_by = discountAuthorizedBy;
        
        await supabase.from("pdv_cashier_movements").insert(movementData);

        const updates: Record<string, number> = {
          total_sales: activeSession.total_sales + amount,
        };

        if (paymentMethod === "dinheiro") {
          updates.total_cash = activeSession.total_cash + amount;
        } else if (paymentMethod === "cartao") {
          updates.total_card = activeSession.total_card + amount;
        } else if (paymentMethod === "pix") {
          updates.total_pix = activeSession.total_pix + amount;
        }

        await supabase
          .from("pdv_cashier_sessions")
          .update(updates)
          .eq("id", activeSession.id);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success("Pagamento da mesa registrado!");
    },
    onError: (error) => {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro ao registrar pagamento");
    },
  });

  return {
    registerPayment: registerPayment.mutateAsync,
    isRegisteringPayment: registerPayment.isPending,
    registerTablePayment: registerTablePayment.mutateAsync,
    isRegisteringTablePayment: registerTablePayment.isPending,
  };
}
