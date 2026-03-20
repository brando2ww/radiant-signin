import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useEstablishmentId() {
  const { user } = useAuth();

  const { data: visibleUserId, isLoading } = useQuery({
    queryKey: ["establishment-id", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from("establishment_users")
        .select("establishment_owner_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      return data?.establishment_owner_id || user.id;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  return {
    visibleUserId: visibleUserId || user?.id || null,
    isLoading,
  };
}
