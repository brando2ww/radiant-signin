import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PrizeWinWithDetails {
  id: string;
  campaign_id: string;
  prize_id: string;
  evaluation_id: string;
  customer_name: string;
  customer_whatsapp: string;
  coupon_code: string;
  coupon_expires_at: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
  prize_name: string;
  campaign_name: string;
}

export const useAllPrizeWins = () => {
  return useQuery({
    queryKey: ["all-prize-wins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Get user campaigns
      const { data: campaigns, error: cErr } = await supabase
        .from("evaluation_campaigns")
        .select("id, name")
        .eq("user_id", user.id);
      if (cErr) throw cErr;
      if (!campaigns?.length) return [];

      const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));
      const campaignIds = campaigns.map((c) => c.id);

      // Get all prizes for these campaigns
      const { data: prizes, error: pErr } = await supabase
        .from("campaign_prizes")
        .select("id, name, campaign_id")
        .in("campaign_id", campaignIds);
      if (pErr) throw pErr;
      const prizeMap = new Map((prizes || []).map((p) => [p.id, p.name]));

      // Get all wins
      const { data: wins, error: wErr } = await supabase
        .from("campaign_prize_wins")
        .select("*")
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false });
      if (wErr) throw wErr;

      return (wins || []).map((w) => ({
        ...w,
        prize_name: prizeMap.get(w.prize_id) || "Prêmio removido",
        campaign_name: campaignMap.get(w.campaign_id) || "Campanha removida",
      })) as PrizeWinWithDetails[];
    },
  });
};

export const useRedeemCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const { data, error } = await supabase
        .from("campaign_prize_wins")
        .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
        .eq("coupon_code", couponCode)
        .eq("is_redeemed", false)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-prize-wins"] });
      toast.success("Cupom resgatado com sucesso!");
    },
    onError: (e: Error) => toast.error("Erro ao resgatar: " + e.message),
  });
};

export const useLookupCoupon = () => {
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const { data, error } = await supabase
        .from("campaign_prize_wins")
        .select("*")
        .eq("coupon_code", couponCode.trim().toUpperCase())
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Cupom não encontrado");
      return data;
    },
  });
};
