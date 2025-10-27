import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";

interface DashboardMetrics {
  todaySales: number;
  todayOrders: number;
  activeOrders: number;
  averageTicket: number;
  monthSales: number;
  monthOrders: number;
  cashierBalance: number;
  cashierOpen: boolean;
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface SalesByHour {
  hour: number;
  total: number;
  orders: number;
}

export function usePDVDashboard() {
  const { user } = useAuth();

  // Métricas principais
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["pdv-dashboard-metrics", user?.id],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!user?.id) throw new Error("User not authenticated");

      const today = new Date();
      const startToday = startOfDay(today).toISOString();
      const endToday = endOfDay(today).toISOString();
      const startMonth = startOfMonth(today).toISOString();
      const endMonth = endOfMonth(today).toISOString();

      // Vendas e pedidos de hoje
      const { data: todayOrders, error: todayError } = await supabase
        .from("pdv_orders")
        .select("total, status")
        .eq("user_id", user.id)
        .gte("created_at", startToday)
        .lte("created_at", endToday);

      if (todayError) throw todayError;

      const closedToday = todayOrders?.filter((o) => o.status === "fechada") || [];
      const todaySales = closedToday.reduce((sum, o) => sum + (o.total || 0), 0);
      const todayOrdersCount = closedToday.length;

      // Pedidos ativos
      const activeOrders =
        todayOrders?.filter((o) => o.status === "aberta").length || 0;

      // Vendas e pedidos do mês
      const { data: monthOrders, error: monthError } = await supabase
        .from("pdv_orders")
        .select("total")
        .eq("user_id", user.id)
        .eq("status", "fechada")
        .gte("created_at", startMonth)
        .lte("created_at", endMonth);

      if (monthError) throw monthError;

      const monthSales = monthOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const monthOrdersCount = monthOrders?.length || 0;

      // Ticket médio
      const averageTicket = todayOrdersCount > 0 ? todaySales / todayOrdersCount : 0;

      // Status do caixa
      const { data: cashierSession } = await supabase
        .from("pdv_cashier_sessions")
        .select("*")
        .eq("user_id", user.id)
        .is("closed_at", null)
        .maybeSingle();

      const cashierBalance = cashierSession
        ? (cashierSession.opening_balance || 0) +
          (cashierSession.total_cash || 0) -
          (cashierSession.total_withdrawals || 0)
        : 0;

      return {
        todaySales,
        todayOrders: todayOrdersCount,
        activeOrders,
        averageTicket,
        monthSales,
        monthOrders: monthOrdersCount,
        cashierBalance,
        cashierOpen: !!cashierSession,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Produtos mais vendidos (últimos 7 dias)
  const { data: topProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["pdv-top-products", user?.id],
    queryFn: async (): Promise<TopProduct[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

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
        .gte("order.created_at", sevenDaysAgo);

      if (error) throw error;

      // Agrupar por produto
      const grouped = (data || []).reduce((acc: Record<string, TopProduct>, item: any) => {
        const name = item.product_name;
        if (!acc[name]) {
          acc[name] = {
            product_name: name,
            total_quantity: 0,
            total_revenue: 0,
          };
        }
        acc[name].total_quantity += item.quantity;
        acc[name].total_revenue += item.subtotal;
        return acc;
      }, {});

      return Object.values(grouped)
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
    },
    enabled: !!user?.id,
  });

  // Vendas por hora (hoje)
  const { data: salesByHour = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["pdv-sales-by-hour", user?.id],
    queryFn: async (): Promise<SalesByHour[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const today = new Date();
      const startToday = startOfDay(today).toISOString();
      const endToday = endOfDay(today).toISOString();

      const { data, error } = await supabase
        .from("pdv_orders")
        .select("closed_at, total")
        .eq("user_id", user.id)
        .eq("status", "fechada")
        .gte("closed_at", startToday)
        .lte("closed_at", endToday)
        .not("closed_at", "is", null);

      if (error) throw error;

      // Agrupar por hora
      const byHour: Record<number, { total: number; orders: number }> = {};
      
      for (let i = 0; i < 24; i++) {
        byHour[i] = { total: 0, orders: 0 };
      }

      (data || []).forEach((order: any) => {
        const hour = new Date(order.closed_at).getHours();
        byHour[hour].total += order.total || 0;
        byHour[hour].orders += 1;
      });

      return Object.entries(byHour).map(([hour, data]) => ({
        hour: parseInt(hour),
        total: data.total,
        orders: data.orders,
      }));
    },
    enabled: !!user?.id,
  });

  const isLoading = isLoadingMetrics || isLoadingProducts || isLoadingSales;

  return {
    metrics,
    topProducts,
    salesByHour,
    isLoading,
  };
}
