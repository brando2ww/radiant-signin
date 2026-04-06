import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEvaluationQuestionTexts() {
  return useQuery({
    queryKey: ["evaluation-question-texts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Fetch from evaluation_questions (legacy)
      const { data: legacyQ } = await supabase
        .from("evaluation_questions")
        .select("id, question_text")
        .eq("user_id", user.id);

      // Fetch from evaluation_campaign_questions
      const { data: campQ } = await supabase
        .from("evaluation_campaign_questions")
        .select("id, question_text");

      const map = new Map<string, string>();
      (legacyQ || []).forEach(q => map.set(q.id, q.question_text));
      (campQ || []).forEach(q => map.set(q.id, q.question_text));
      return map;
    },
  });
}

export function useAllTimeCustomerWhatsapps() {
  return useQuery({
    queryKey: ["all-time-customer-whatsapps"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("customer_evaluations")
        .select("customer_whatsapp, evaluation_date")
        .eq("user_id", user.id)
        .order("evaluation_date", { ascending: true });

      if (error) throw error;

      // Map whatsapp -> first evaluation date
      const firstEvalMap = new Map<string, string>();
      (data || []).forEach(e => {
        if (!firstEvalMap.has(e.customer_whatsapp)) {
          firstEvalMap.set(e.customer_whatsapp, e.evaluation_date);
        }
      });
      return firstEvalMap;
    },
  });
}
