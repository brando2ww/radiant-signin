import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WaitlistData {
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  monthly_revenue?: string;
  main_challenge: string;
  referred_by?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export const useWaitlist = () => {
  const joinWaitlist = useMutation({
    mutationFn: async (data: WaitlistData) => {
      // Check if email already exists
      const { data: existing } = await supabase
        .from("waitlist")
        .select("email")
        .eq("email", data.email)
        .single();

      if (existing) {
        throw new Error("Este e-mail já está cadastrado na fila de espera!");
      }

      const { data: result, error } = await supabase
        .from("waitlist")
        .insert([data])
        .select("position, referral_code")
        .single();

      if (error) throw error;
      return result;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getWaitlistCount = useQuery({
    queryKey: ["waitlist-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  return {
    joinWaitlist,
    waitlistCount: getWaitlistCount.data,
    isLoading: joinWaitlist.isPending,
  };
};
