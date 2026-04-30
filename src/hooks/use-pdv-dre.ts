import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth } from "date-fns";

export function usePDVDre(selectedMonth?: Date) {
  const { user } = useAuth();
  const refDate = selectedMonth || new Date();

  const { data, isLoading } = useQuery({
    queryKey: ["pdv-dre", user?.id, format(refDate, "yyyy-MM")],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const ms = format(startOfMonth(refDate), "yyyy-MM-dd");
      const me = format(endOfMonth(refDate), "yyyy-MM-dd");

      // PDV orders
      const { data: pdvOrders } = await supabase
        .from("pdv_orders")
        .select("total, discount, status, cancelled_at")
        .eq("user_id", user.id)
        .gte("created_at", ms)
        .lte("created_at", me + "T23:59:59");

      let pdvSales = 0;
      let pdvDiscounts = 0;
      let pdvCancellations = 0;
      (pdvOrders || []).forEach((o) => {
        if (o.status === "closed") {
          pdvSales += Number(o.total);
          pdvDiscounts += Number(o.discount || 0);
        }
        if (o.cancelled_at) pdvCancellations += Number(o.total);
      });

      // Delivery orders
      const { data: deliveryOrders } = await supabase
        .from("delivery_orders")
        .select("total, discount, status")
        .eq("user_id", user.id)
        .gte("created_at", ms)
        .lte("created_at", me + "T23:59:59");

      let deliverySales = 0;
      let deliveryDiscounts = 0;
      let deliveryCancellations = 0;
      (deliveryOrders || []).forEach((o) => {
        if (o.status === "delivered") {
          deliverySales += Number(o.total);
          deliveryDiscounts += Number(o.discount || 0);
        }
        if (o.status === "cancelled") deliveryCancellations += Number(o.total);
      });

      const grossRevenue = pdvSales + deliverySales;
      const totalDiscounts = pdvDiscounts + deliveryDiscounts;
      const totalCancellations = pdvCancellations + deliveryCancellations;

      // Taxas de meios de pagamento (snapshot por venda)
      // 1) PDV — soma fee_amount de pdv_payments cujos pedidos sejam do dono e do mês
      const pdvOrderIds = (pdvOrders || [])
        .filter((o: any) => o.status === "closed")
        .map((o: any) => o.id)
        .filter(Boolean) as string[];
      let paymentFees = 0;
      if (pdvOrderIds.length > 0) {
        const { data: pays } = await supabase
          .from("pdv_payments")
          .select("fee_amount")
          .in("order_id", pdvOrderIds);
        (pays || []).forEach((p: any) => {
          paymentFees += Number(p.fee_amount || 0);
        });
      }
      // 2) Recebimentos financeiros (contas a receber pagas no período)
      const { data: receivedTx } = await supabase
        .from("pdv_financial_transactions")
        .select("fee_amount")
        .eq("user_id", user.id)
        .eq("transaction_type", "receivable")
        .eq("status", "paid")
        .gte("payment_date", ms)
        .lte("payment_date", me);
      (receivedTx || []).forEach((t: any) => {
        paymentFees += Number(t.fee_amount || 0);
      });

      const deductions = totalDiscounts + totalCancellations + paymentFees;
      const netRevenue = grossRevenue - deductions;

      // CMV — from recipes + sold items
      let cmv = 0;
      const { data: soldItems } = await supabase
        .from("pdv_order_items")
        .select("product_id, quantity, order_id")
        .in("order_id", (pdvOrders || []).filter(o => o.status === "closed").map(() => ""));
      // Simplified: try to get recipe costs
      const { data: recipes } = await supabase
        .from("pdv_product_recipes")
        .select("product_id, quantity, unit, pdv_ingredients(unit_cost)");

      const recipeCostMap: Record<string, number> = {};
      (recipes || []).forEach((r: any) => {
        const cost = Number(r.quantity) * Number(r.pdv_ingredients?.unit_cost || 0);
        recipeCostMap[r.product_id] = (recipeCostMap[r.product_id] || 0) + cost;
      });

      // Get sold items from closed orders
      const closedOrderIds = (pdvOrders || []).filter(o => o.status === "closed").map(() => "dummy");
      // Better approach: get all order items for this month
      const { data: orderItems } = await supabase
        .from("pdv_order_items")
        .select("product_id, quantity")
        .gte("created_at", ms)
        .lte("created_at", me + "T23:59:59");

      (orderItems || []).forEach((item: any) => {
        if (recipeCostMap[item.product_id]) {
          cmv += recipeCostMap[item.product_id] * Number(item.quantity);
        }
      });

      const grossProfit = netRevenue - cmv;

      // Operating expenses from financial transactions (payable, paid)
      const { data: expenses } = await supabase
        .from("pdv_financial_transactions")
        .select("amount, description, chart_account_id, pdv_chart_of_accounts(name)")
        .eq("user_id", user.id)
        .eq("transaction_type", "payable")
        .eq("status", "paid")
        .gte("payment_date", ms)
        .lte("payment_date", me);

      const expensesByCategory: Record<string, number> = {};
      let totalExpenses = 0;
      (expenses || []).forEach((e: any) => {
        const cat = e.pdv_chart_of_accounts?.name || "Outras despesas";
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.amount);
        totalExpenses += Number(e.amount);
      });

      const operatingProfit = grossProfit - totalExpenses;
      const netProfit = operatingProfit; // simplified

      const pct = (v: number) => (grossRevenue > 0 ? ((v / grossRevenue) * 100) : 0);

      return {
        pdvSales,
        deliverySales,
        grossRevenue,
        totalDiscounts,
        totalCancellations,
        deductions,
        netRevenue,
        cmv,
        grossProfit,
        expensesByCategory,
        totalExpenses,
        operatingProfit,
        netProfit,
        marginGross: pct(grossProfit),
        marginOperating: pct(operatingProfit),
        marginNet: pct(netProfit),
      };
    },
    enabled: !!user,
  });

  return { data, isLoading };
}
