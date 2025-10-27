import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export interface DeliveryMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  completedOrders: number;
  cancelledOrders: number;
  deliveryOrders: number;
  pickupOrders: number;
}

export interface DailySales {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export const useDeliveryMetrics = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["delivery-metrics", userId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString());

      if (error) throw error;

      const metrics: DeliveryMetrics = {
        totalOrders: data.length,
        totalRevenue: data.reduce((sum, order) => sum + Number(order.total), 0),
        averageTicket: data.length > 0 
          ? data.reduce((sum, order) => sum + Number(order.total), 0) / data.length 
          : 0,
        completedOrders: data.filter(o => o.status === "delivered").length,
        cancelledOrders: data.filter(o => o.status === "cancelled").length,
        deliveryOrders: data.filter(o => o.order_type === "delivery").length,
        pickupOrders: data.filter(o => o.order_type === "pickup").length,
      };

      return metrics;
    },
  });
};

export const useDailySales = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["daily-sales", userId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_orders")
        .select("created_at, total")
        .eq("user_id", userId)
        .neq("status", "cancelled")
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString())
        .order("created_at");

      if (error) throw error;

      const salesByDate = new Map<string, { orders: number; revenue: number }>();

      data.forEach((order) => {
        const date = format(new Date(order.created_at), "yyyy-MM-dd");
        const current = salesByDate.get(date) || { orders: 0, revenue: 0 };
        salesByDate.set(date, {
          orders: current.orders + 1,
          revenue: current.revenue + Number(order.total),
        });
      });

      const dailySales: DailySales[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const data = salesByDate.get(dateStr) || { orders: 0, revenue: 0 };
        dailySales.push({
          date: dateStr,
          ...data,
        });
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      return dailySales;
    },
  });
};

export const useTopProducts = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["top-products", userId, startDate, endDate],
    queryFn: async () => {
      const { data: orders, error: ordersError } = await supabase
        .from("delivery_orders")
        .select("id")
        .eq("user_id", userId)
        .neq("status", "cancelled")
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString());

      if (ordersError) throw ordersError;
      if (!orders.length) return [];

      const orderIds = orders.map(o => o.id);

      const { data: items, error: itemsError } = await supabase
        .from("delivery_order_items")
        .select("product_id, product_name, quantity, subtotal")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;

      const productStats = new Map<string, { name: string; quantity: number; revenue: number }>();

      items.forEach((item) => {
        const current = productStats.get(item.product_id) || {
          name: item.product_name,
          quantity: 0,
          revenue: 0,
        };
        productStats.set(item.product_id, {
          name: item.product_name,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + Number(item.subtotal),
        });
      });

      const topProducts: TopProduct[] = Array.from(productStats.entries())
        .map(([productId, stats]) => ({
          productId,
          productName: stats.name,
          quantity: stats.quantity,
          revenue: stats.revenue,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      return topProducts;
    },
  });
};
