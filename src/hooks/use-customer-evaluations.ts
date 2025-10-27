import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CustomerEvaluation {
  id: string;
  user_id: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_birth_date: string;
  nps_score: number | null;
  evaluation_date: string;
  created_at: string;
}

export interface EvaluationAnswer {
  id: string;
  evaluation_id: string;
  question_id: string;
  score: number;
  created_at: string;
  evaluation_questions?: {
    question_text: string;
  };
}

export interface EvaluationWithAnswers extends CustomerEvaluation {
  evaluation_answers: EvaluationAnswer[];
}

export const useCustomerEvaluations = (filters?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["customer-evaluations", filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let query = supabase
        .from("customer_evaluations")
        .select(`
          *,
          evaluation_answers (
            id,
            question_id,
            score,
            evaluation_questions (
              question_text
            )
          )
        `)
        .eq("user_id", user.id)
        .order("evaluation_date", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("evaluation_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("evaluation_date", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EvaluationWithAnswers[];
    },
  });
};

export const useEvaluationStats = (startDate?: string, endDate?: string) => {
  const { data: evaluations } = useCustomerEvaluations({ startDate, endDate });

  if (!evaluations) return null;

  const totalEvaluations = evaluations.length;

  // Calcular média geral de satisfação (1-5)
  const allScores = evaluations.flatMap(e => e.evaluation_answers.map(a => a.score));
  const avgSatisfaction = allScores.length > 0 
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    : 0;

  // Calcular NPS
  const npsScores = evaluations.filter(e => e.nps_score !== null).map(e => e.nps_score!);
  const promoters = npsScores.filter(s => s >= 9).length;
  const detractors = npsScores.filter(s => s <= 6).length;
  const nps = npsScores.length > 0 
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : 0;

  const avgNps = npsScores.length > 0
    ? npsScores.reduce((sum, score) => sum + score, 0) / npsScores.length
    : 0;

  // Calcular média por pergunta
  const questionStats = new Map<string, { text: string; scores: number[] }>();
  
  evaluations.forEach(evaluation => {
    evaluation.evaluation_answers.forEach(answer => {
      if (!questionStats.has(answer.question_id)) {
        questionStats.set(answer.question_id, {
          text: answer.evaluation_questions?.question_text || "Pergunta",
          scores: [],
        });
      }
      questionStats.get(answer.question_id)!.scores.push(answer.score);
    });
  });

  const questionAverages = Array.from(questionStats.entries()).map(([id, data]) => ({
    question_id: id,
    question_text: data.text,
    average: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
    total: data.scores.length,
  })).sort((a, b) => a.average - b.average);

  // Evolução diária
  const dailyData = new Map<string, { date: string; scores: number[]; npsScores: number[] }>();
  
  evaluations.forEach(evaluation => {
    const date = new Date(evaluation.evaluation_date).toISOString().split('T')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, { date, scores: [], npsScores: [] });
    }
    const dayData = dailyData.get(date)!;
    evaluation.evaluation_answers.forEach(answer => dayData.scores.push(answer.score));
    if (evaluation.nps_score !== null) {
      dayData.npsScores.push(evaluation.nps_score);
    }
  });

  const evolutionData = Array.from(dailyData.values()).map(day => ({
    date: day.date,
    avgSatisfaction: day.scores.length > 0 
      ? day.scores.reduce((sum, s) => sum + s, 0) / day.scores.length
      : 0,
    avgNps: day.npsScores.length > 0
      ? day.npsScores.reduce((sum, s) => sum + s, 0) / day.npsScores.length
      : 0,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Distribuição NPS
  const npsDistribution = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: npsScores.filter(s => s === i).length,
  }));

  return {
    totalEvaluations,
    avgSatisfaction,
    nps,
    avgNps,
    questionAverages,
    evolutionData,
    npsDistribution,
    promoters,
    detractors,
    neutrals: npsScores.length - promoters - detractors,
  };
};

export const useEvaluationById = (id: string) => {
  return useQuery({
    queryKey: ["evaluation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_evaluations")
        .select(`
          *,
          evaluation_answers (
            id,
            question_id,
            score,
            evaluation_questions (
              question_text
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as EvaluationWithAnswers;
    },
  });
};

export const useExportEvaluations = () => {
  return useMutation({
    mutationFn: async (filters?: { startDate?: string; endDate?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let query = supabase
        .from("customer_evaluations")
        .select(`
          *,
          evaluation_answers (
            question_id,
            score,
            evaluation_questions (
              question_text
            )
          )
        `)
        .eq("user_id", user.id)
        .order("evaluation_date", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("evaluation_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("evaluation_date", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Criar CSV
      const csvRows = [];
      csvRows.push(["Data", "Nome", "WhatsApp", "Data Nascimento", "NPS", "Média Geral"].join(","));

      data.forEach((evaluation: any) => {
        const avgScore = evaluation.evaluation_answers.length > 0
          ? evaluation.evaluation_answers.reduce((sum: number, a: any) => sum + a.score, 0) / evaluation.evaluation_answers.length
          : 0;

        csvRows.push([
          new Date(evaluation.evaluation_date).toLocaleDateString("pt-BR"),
          evaluation.customer_name,
          evaluation.customer_whatsapp,
          new Date(evaluation.customer_birth_date).toLocaleDateString("pt-BR"),
          evaluation.nps_score || "",
          avgScore.toFixed(2),
        ].join(","));
      });

      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avaliacoes-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("CSV exportado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao exportar: " + error.message);
    },
  });
};
