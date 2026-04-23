import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstablishmentId } from "@/hooks/use-establishment-id";

/**
 * Subscribes to realtime changes that affect the salão↔caixa flow:
 * pdv_comandas, pdv_comanda_items, pdv_orders, pdv_tables.
 *
 * On any change for the current establishment, invalidates the relevant
 * react-query caches so the garçom and caixa screens stay in sync without
 * manual reloads.
 */
export function usePDVComandasRealtime() {
  const { visibleUserId } = useEstablishmentId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!visibleUserId) return;

    const channel = supabase
      .channel(`pdv-salao-realtime-${visibleUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pdv_comandas",
          filter: `user_id=eq.${visibleUserId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
          queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pdv_comanda_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
          queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pdv_tables",
          filter: `user_id=eq.${visibleUserId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pdv_orders",
          filter: `user_id=eq.${visibleUserId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pdv-orders"] });
          queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [visibleUserId, queryClient]);
}
