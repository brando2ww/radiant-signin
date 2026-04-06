import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FunnelData {
  pageViews: number;
  addToCarts: number;
  purchases: number;
  viewToCartRate: number;
  cartToPurchaseRate: number;
  overallConversionRate: number;
}

export function useDeliveryFunnel(userId: string, startDate: Date, endDate: Date) {
  return useQuery<FunnelData>({
    queryKey: ["delivery-funnel", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_funnel_events")
        .select("event_type, session_id")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      const sessions = new Map<string, Set<string>>();
      (data || []).forEach((row) => {
        if (!sessions.has(row.session_id)) {
          sessions.set(row.session_id, new Set());
        }
        sessions.get(row.session_id)!.add(row.event_type);
      });

      let pageViews = 0;
      let addToCarts = 0;
      let purchases = 0;

      sessions.forEach((events) => {
        if (events.has("page_view")) pageViews++;
        if (events.has("add_to_cart")) addToCarts++;
        if (events.has("purchase")) purchases++;
      });

      const viewToCartRate = pageViews > 0 ? (addToCarts / pageViews) * 100 : 0;
      const cartToPurchaseRate = addToCarts > 0 ? (purchases / addToCarts) * 100 : 0;
      const overallConversionRate = pageViews > 0 ? (purchases / pageViews) * 100 : 0;

      return {
        pageViews,
        addToCarts,
        purchases,
        viewToCartRate,
        cartToPurchaseRate,
        overallConversionRate,
      };
    },
    enabled: !!userId,
  });
}

// Helper to get/create session ID for anonymous tracking
export function getFunnelSessionId(): string {
  const key = "delivery_funnel_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Track a funnel event (fire-and-forget, no auth needed)
export async function trackFunnelEvent(
  userId: string,
  eventType: "page_view" | "add_to_cart" | "purchase",
  metadata?: Record<string, unknown>
) {
  const sessionId = getFunnelSessionId();
  await supabase.from("delivery_funnel_events").insert({
    user_id: userId,
    session_id: sessionId,
    event_type: eventType,
    metadata: metadata || null,
  });
}
