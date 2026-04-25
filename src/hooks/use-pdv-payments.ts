import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
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

export interface PartialPaymentItem {
  itemId: string;
  quantityPaid: number;
  unitPrice: number;
}

interface RegisterPartialPaymentParams {
  comandaId: string;
  orderId?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeAmount?: number;
  installments?: number;
  discountAmount?: number;
  discountReason?: string;
  discountAuthorizedBy?: string;
  partialItems: PartialPaymentItem[];
  chargingSessionId: string;
}

export function usePDVPayments() {
  const { user } = useAuth();
  const { visibleUserId } = useEstablishmentId();
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

      // 1. Close the comanda (only if still open OR awaiting payment from waiter)
      const { data: updatedComandas, error: comandaError } = await supabase
        .from("pdv_comandas")
        .update({
          status: "fechada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", comandaId)
        .in("status", ["aberta", "aguardando_pagamento", "em_cobranca"])
        .select();

      if (comandaError) throw comandaError;
      if (!updatedComandas || updatedComandas.length === 0) {
        throw new Error("Comanda já finalizada");
      }

      // 1b. If comanda was tied to a table-order, free the table when it was the last open one
      if (orderId) {
        const { count } = await supabase
          .from("pdv_comandas")
          .select("*", { count: "exact", head: true })
          .eq("order_id", orderId)
          .in("status", ["aberta", "aguardando_pagamento", "em_cobranca"]);

        if ((count ?? 0) === 0) {
          await supabase
            .from("pdv_orders")
            .update({ status: "fechada", updated_at: new Date().toISOString() })
            .eq("id", orderId);

          await supabase
            .from("pdv_tables")
            .update({
              status: "livre",
              current_order_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("current_order_id", orderId);
        }
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
      const ownerId = visibleUserId || user.id;
      const { data: activeSession } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", ownerId)
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

      // 1. Close all comandas for this table (open OR awaiting payment)
      const { data: updatedComandas, error: comandaError } = await supabase
        .from("pdv_comandas")
        .update({
          status: "fechada",
          updated_at: new Date().toISOString(),
        })
        .in("id", comandaIds)
        .in("status", ["aberta", "aguardando_pagamento", "em_cobranca"])
        .select();

      if (comandaError) throw comandaError;
      if (!updatedComandas || updatedComandas.length === 0) {
        throw new Error("Comandas já finalizadas");
      }

      // 2. Free the table and close the order
      const { error: tableError } = await supabase
        .from("pdv_tables")
        .update({
          status: "livre",
          current_order_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tableId);

      if (tableError) throw tableError;

      // Also close the underlying order(s) for this table
      const orderIds = Array.from(
        new Set(updatedComandas.map((c: any) => c.order_id).filter(Boolean)),
      ) as string[];
      if (orderIds.length > 0) {
        await supabase
          .from("pdv_orders")
          .update({ status: "fechada", updated_at: new Date().toISOString() })
          .in("id", orderIds);
      }

      // 3. Register sale in cashier
      const ownerId = visibleUserId || user.id;
      const { data: activeSession } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", ownerId)
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

  // Register PARTIAL payment: pay only selected items, keep comanda open if any pending remain
  const registerPartialPayment = useMutation({
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
      partialItems,
      chargingSessionId,
    }: RegisterPartialPaymentParams) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      if (!partialItems.length) throw new Error("Nenhum item selecionado");

      // 1. Carrega itens-alvo do banco para validar quantidades atuais
      const itemIds = partialItems.map((p) => p.itemId);
      const { data: dbItems, error: fetchErr } = await supabase
        .from("pdv_comanda_items")
        .select("id, quantity, paid_quantity, unit_price, charging_session_id")
        .in("id", itemIds);
      if (fetchErr) throw fetchErr;

      // Valida que cada item ainda está disponível para esta sessão
      for (const p of partialItems) {
        const db = (dbItems || []).find((d: any) => d.id === p.itemId);
        if (!db) throw new Error("Item não encontrado");
        const remaining = db.quantity - (db.paid_quantity || 0);
        if (p.quantityPaid > remaining) {
          throw new Error(`Quantidade indisponível para um dos itens (restam ${remaining}).`);
        }
        if (db.charging_session_id && db.charging_session_id !== chargingSessionId) {
          throw new Error("Item travado por outro operador. Atualize e tente novamente.");
        }
      }

      // 2. Atualiza paid_quantity em cada item (incrementando)
      for (const p of partialItems) {
        const db = (dbItems || []).find((d: any) => d.id === p.itemId);
        const newPaid = (db?.paid_quantity || 0) + p.quantityPaid;
        const { error: updErr } = await supabase
          .from("pdv_comanda_items")
          .update({ paid_quantity: newPaid })
          .eq("id", p.itemId);
        if (updErr) throw updErr;
      }

      // 3. Insere registro em pdv_payments (somente se houver order_id)
      let createdPaymentId: string | null = null;
      if (orderId) {
        const { data: pay, error: payErr } = await supabase
          .from("pdv_payments")
          .insert({
            order_id: orderId,
            payment_method: paymentMethod,
            amount,
            cash_received: cashReceived || null,
            change_amount: changeAmount || null,
            installments: installments || 1,
          })
          .select("id")
          .single();
        if (payErr) {
          console.error("Partial payment insert error:", payErr);
        } else {
          createdPaymentId = pay?.id ?? null;
        }
      }

      // 4. Auditoria detalhada em pdv_payment_items
      if (createdPaymentId) {
        const rows = partialItems.map((p) => ({
          payment_id: createdPaymentId,
          comanda_item_id: p.itemId,
          quantity_paid: p.quantityPaid,
          unit_price: p.unitPrice,
          subtotal_paid: p.unitPrice * p.quantityPaid,
        }));
        const { error: piErr } = await supabase.from("pdv_payment_items" as any).insert(rows);
        if (piErr) console.error("payment_items insert error:", piErr);
      }

      // 5. Libera locks dos itens cobrados
      await (supabase.rpc as any)("pdv_unlock_comanda_items", {
        p_item_ids: itemIds,
        p_session_id: chargingSessionId,
      });

      // 6. Verifica se restou algum item pendente na comanda
      const { data: remainingItems } = await supabase
        .from("pdv_comanda_items")
        .select("quantity, paid_quantity")
        .eq("comanda_id", comandaId);
      const stillPending = (remainingItems || []).some(
        (r: any) => (r.quantity - (r.paid_quantity || 0)) > 0,
      );

      if (!stillPending) {
        // Tudo pago — finaliza comanda como o registerPayment normal faria
        await supabase
          .from("pdv_comandas")
          .update({ status: "fechada", updated_at: new Date().toISOString() })
          .eq("id", comandaId)
          .in("status", ["aberta", "aguardando_pagamento", "em_cobranca"]);

        if (orderId) {
          const { count } = await supabase
            .from("pdv_comandas")
            .select("*", { count: "exact", head: true })
            .eq("order_id", orderId)
            .in("status", ["aberta", "aguardando_pagamento", "em_cobranca"]);

          if ((count ?? 0) === 0) {
            await supabase
              .from("pdv_orders")
              .update({ status: "fechada", updated_at: new Date().toISOString() })
              .eq("id", orderId);

            await supabase
              .from("pdv_tables")
              .update({
                status: "livre",
                current_order_id: null,
                updated_at: new Date().toISOString(),
              })
              .eq("current_order_id", orderId);
          }
        }
      } else {
        // Mantém aberta: se estava em_cobranca, devolve para aguardando_pagamento
        await supabase
          .from("pdv_comandas")
          .update({ status: "aguardando_pagamento", updated_at: new Date().toISOString() })
          .eq("id", comandaId)
          .eq("status", "em_cobranca");
      }

      // 7. Movimento de caixa
      const ownerId = visibleUserId || user.id;
      const { data: activeSession } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", ownerId)
        .is("closed_at", null)
        .maybeSingle();

      if (activeSession) {
        const movementData: any = {
          cashier_session_id: activeSession.id,
          type: "venda",
          amount,
          payment_method: paymentMethod,
          description: `Comanda #${comandaId.slice(0, 8)} — pagamento parcial`,
        };
        if (discountReason) movementData.discount_reason = discountReason;
        if (discountAuthorizedBy) movementData.discount_authorized_by = discountAuthorizedBy;
        await supabase.from("pdv_cashier_movements").insert(movementData);

        const updates: Record<string, number> = {
          total_sales: activeSession.total_sales + amount,
        };
        if (paymentMethod === "dinheiro") updates.total_cash = activeSession.total_cash + amount;
        else if (paymentMethod === "cartao") updates.total_card = activeSession.total_card + amount;
        else if (paymentMethod === "pix") updates.total_pix = activeSession.total_pix + amount;

        await supabase
          .from("pdv_cashier_sessions")
          .update(updates)
          .eq("id", activeSession.id);
      }

      return { success: true, fullyPaid: !stillPending };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
      queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
      toast.success(res.fullyPaid ? "Comanda paga e fechada!" : "Pagamento parcial registrado");
    },
    onError: (error: any) => {
      console.error("Erro pagamento parcial:", error);
      toast.error(error?.message || "Erro ao registrar pagamento parcial");
    },
  });

  return {
    registerPayment: registerPayment.mutateAsync,
    isRegisteringPayment: registerPayment.isPending,
    registerTablePayment: registerTablePayment.mutateAsync,
    isRegisteringTablePayment: registerTablePayment.isPending,
    registerPartialPayment: registerPartialPayment.mutateAsync,
    isRegisteringPartialPayment: registerPartialPayment.isPending,
  };
}
