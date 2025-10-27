import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, endOfDay } from "date-fns";

interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  cancelledOrders: number;
  cancelledValue: number;
}

interface PaymentMethodReport {
  method: string;
  total: number;
  count: number;
  percentage: number;
}

interface ProductReport {
  product_name: string;
  quantity: number;
  revenue: number;
  orders: number;
}

interface SourceReport {
  source: string;
  total: number;
  count: number;
  percentage: number;
}

interface HourlyReport {
  hour: number;
  sales: number;
  orders: number;
  averageTicket: number;
}

export function usePDVReports(startDate: Date, endDate: Date) {
  const { user } = useAuth();

  const start = startOfDay(startDate).toISOString();
  const end = endOfDay(endDate).toISOString();

  // Relatório de vendas geral
  const { data: salesReport, isLoading: isLoadingSales } = useQuery({
    queryKey: ["pdv-sales-report", user?.id, start, end],
    queryFn: async (): Promise<SalesReport> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pdv_orders")
        .select("total, status")
        .eq("user_id", user.id)
        .gte("created_at", start)
        .lte("created_at", end);

      if (error) throw error;

      const closed = data?.filter((o) => o.status === "fechada") || [];
      const cancelled = data?.filter((o) => o.status === "cancelada") || [];

      const totalSales = closed.reduce((sum, o) => sum + (o.total || 0), 0);
      const cancelledValue = cancelled.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = closed.length;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      return {
        totalSales,
        totalOrders,
        averageTicket,
        cancelledOrders: cancelled.length,
        cancelledValue,
      };
    },
    enabled: !!user?.id,
  });

  // Relatório por forma de pagamento
  const { data: paymentReport = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["pdv-payment-report", user?.id, start, end],
    queryFn: async (): Promise<PaymentMethodReport[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pdv_cashier_movements")
        .select("payment_method, amount, cashier_session_id")
        .eq("type", "venda")
        .not("payment_method", "is", null);

      if (error) throw error;

      // Filtrar por sessões no período
      const { data: sessions } = await supabase
        .from("pdv_cashier_sessions")
        .select("id")
        .eq("user_id", user.id)
        .gte("opened_at", start)
        .lte("opened_at", end);

      const sessionIds = sessions?.map((s) => s.id) || [];
      const filteredData = data?.filter((m) =>
        sessionIds.includes(m.cashier_session_id)
      ) || [];

      // Agrupar por método
      const grouped: Record<string, { total: number; count: number }> = {};
      filteredData.forEach((item) => {
        const method = item.payment_method || "outros";
        if (!grouped[method]) {
          grouped[method] = { total: 0, count: 0 };
        }
        grouped[method].total += item.amount || 0;
        grouped[method].count += 1;
      });

      const total = Object.values(grouped).reduce((sum, g) => sum + g.total, 0);

      return Object.entries(grouped).map(([method, data]) => ({
        method,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }));
    },
    enabled: !!user?.id,
  });

  // Relatório por produto
  const { data: productReport = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["pdv-product-report", user?.id, start, end],
    queryFn: async (): Promise<ProductReport[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pdv_order_items")
        .select(`
          product_name,
          quantity,
          subtotal,
          order:pdv_orders!inner(user_id, status, created_at)
        `)
        .eq("order.user_id", user.id)
        .eq("order.status", "fechada")
        .gte("order.created_at", start)
        .lte("order.created_at", end);

      if (error) throw error;

      // Agrupar por produto
      const grouped: Record<string, ProductReport> = {};
      (data || []).forEach((item: any) => {
        const name = item.product_name;
        if (!grouped[name]) {
          grouped[name] = {
            product_name: name,
            quantity: 0,
            revenue: 0,
            orders: 0,
          };
        }
        grouped[name].quantity += item.quantity;
        grouped[name].revenue += item.subtotal;
        grouped[name].orders += 1;
      });

      return Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
    },
    enabled: !!user?.id,
  });

  // Relatório por origem (salão/balcão)
  const { data: sourceReport = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ["pdv-source-report", user?.id, start, end],
    queryFn: async (): Promise<SourceReport[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pdv_orders")
        .select("source, total")
        .eq("user_id", user.id)
        .eq("status", "fechada")
        .gte("created_at", start)
        .lte("created_at", end);

      if (error) throw error;

      // Agrupar por origem
      const grouped: Record<string, { total: number; count: number }> = {};
      (data || []).forEach((order) => {
        const source = order.source;
        if (!grouped[source]) {
          grouped[source] = { total: 0, count: 0 };
        }
        grouped[source].total += order.total || 0;
        grouped[source].count += 1;
      });

      const total = Object.values(grouped).reduce((sum, g) => sum + g.total, 0);

      return Object.entries(grouped).map(([source, data]) => ({
        source,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }));
    },
    enabled: !!user?.id,
  });

  // Relatório por hora
  const { data: hourlyReport = [], isLoading: isLoadingHourly } = useQuery({
    queryKey: ["pdv-hourly-report", user?.id, start, end],
    queryFn: async (): Promise<HourlyReport[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pdv_orders")
        .select("closed_at, total")
        .eq("user_id", user.id)
        .eq("status", "fechada")
        .gte("closed_at", start)
        .lte("closed_at", end)
        .not("closed_at", "is", null);

      if (error) throw error;

      // Agrupar por hora
      const byHour: Record<number, { sales: number; orders: number }> = {};
      for (let i = 0; i < 24; i++) {
        byHour[i] = { sales: 0, orders: 0 };
      }

      (data || []).forEach((order) => {
        const hour = new Date(order.closed_at!).getHours();
        byHour[hour].sales += order.total || 0;
        byHour[hour].orders += 1;
      });

      return Object.entries(byHour).map(([hour, data]) => ({
        hour: parseInt(hour),
        sales: data.sales,
        orders: data.orders,
        averageTicket: data.orders > 0 ? data.sales / data.orders : 0,
      }));
    },
    enabled: !!user?.id,
  });

  const isLoading =
    isLoadingSales ||
    isLoadingPayments ||
    isLoadingProducts ||
    isLoadingSources ||
    isLoadingHourly;

  return {
    salesReport,
    paymentReport,
    productReport,
    sourceReport,
    hourlyReport,
    isLoading,
  };
}
