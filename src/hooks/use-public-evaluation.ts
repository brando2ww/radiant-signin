import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PublicQuestion {
  id: string;
  question_text: string;
  order_position: number;
}

export const usePublicQuestions = (userId: string) => {
  return useQuery({
    queryKey: ["public-questions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_questions")
        .select("id, question_text, order_position")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as PublicQuestion[];
    },
  });
};

export const useNpsEnabled = (userId: string) => {
  return useQuery({
    queryKey: ["nps-enabled", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("nps_enabled")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data?.nps_enabled ?? true;
    },
  });
};

export interface SubmitEvaluationData {
  userId: string;
  customerName: string;
  customerWhatsapp: string;
  customerBirthDate: string;
  npsScore: number | null;
  answers: { questionId: string; score: number }[];
}

export const useSubmitEvaluation = () => {
  return useMutation({
    mutationFn: async (data: SubmitEvaluationData) => {
      // Gerar ID no cliente para evitar SELECT após INSERT
      const evaluationId = crypto.randomUUID();

      // Inserir a avaliação sem SELECT
      const { error: evalError } = await supabase
        .from("customer_evaluations")
        .insert({
          id: evaluationId,
          user_id: data.userId,
          customer_name: data.customerName,
          customer_whatsapp: data.customerWhatsapp,
          customer_birth_date: data.customerBirthDate,
          nps_score: data.npsScore,
        });

      if (evalError) throw evalError;

      // Inserir as respostas usando o ID gerado
      const answers = data.answers.map(answer => ({
        evaluation_id: evaluationId,
        question_id: answer.questionId,
        score: answer.score,
      }));

      const { error: answersError } = await supabase
        .from("evaluation_answers")
        .insert(answers);

      if (answersError) throw answersError;

      return { id: evaluationId };
    },
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar avaliação: " + error.message);
    },
  });
};
