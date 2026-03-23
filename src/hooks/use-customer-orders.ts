import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";

export interface UnifiedOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  source: "pdv" | "delivery";
  payment_method?: string;
}

export function useCustomerOrders(customerId: string | undefined, customerSource: "pdv" | "delivery") {
  const { visibleUserId } = useEstablishmentId();

  return useQuery({
    queryKey: ["customer-orders", customerId, customerSource],
    queryFn: async (): Promise<UnifiedOrder[]> => {
      if (!customerId) return [];
      const results: UnifiedOrder[] = [];

      if (customerSource === "pdv") {
        const { data, error } = await supabase
          .from("pdv_orders")
          .select("id, order_number, total, status, created_at, source")
          .eq("customer_id", customerId)
          .eq("user_id", visibleUserId!)
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error && data) {
          for (const o of data) {
            results.push({
              id: o.id,
              order_number: o.order_number,
              total: o.total ?? 0,
              status: o.status,
              created_at: o.created_at ?? "",
              source: "pdv",
            });
          }
        }
      } else {
        const { data, error } = await supabase
          .from("delivery_orders")
          .select("id, order_number, total, status, created_at, payment_method")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error && data) {
          for (const o of data) {
            results.push({
              id: o.id,
              order_number: o.order_number,
              total: o.total,
              status: o.status,
              created_at: o.created_at,
              source: "delivery",
              payment_method: o.payment_method,
            });
          }
        }
      }

      return results;
    },
    enabled: !!customerId && !!visibleUserId,
  });
}
