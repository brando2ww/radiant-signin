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
  campaign_id?: string | null;
}

export interface EvaluationAnswer {
  id: string;
  evaluation_id?: string;
  question_id: string;
  score: number;
  created_at?: string;
  comment?: string | null;
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
            comment
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

  // Helper para calcular idade
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Validar se a data é válida
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Retornar null se a idade for inválida (negativa ou maior que 120)
    if (age < 0 || age > 120) return null;
    
    return age;
  };

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

  // Calcular idade média
  const ages = evaluations
    .map(e => calculateAge(e.customer_birth_date))
    .filter((age): age is number => age !== null);
  const avgAge = ages.length > 0 
    ? Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length)
    : 0;

  // Distribuição por faixa etária (apenas idades válidas)
  const validAges = ages.filter(a => a !== null && a >= 0);
  const ageDistribution = [
    { ageGroup: '18-25', count: validAges.filter(a => a >= 18 && a <= 25).length },
    { ageGroup: '26-35', count: validAges.filter(a => a >= 26 && a <= 35).length },
    { ageGroup: '36-45', count: validAges.filter(a => a >= 36 && a <= 45).length },
    { ageGroup: '46-60', count: validAges.filter(a => a >= 46 && a <= 60).length },
    { ageGroup: '60+', count: validAges.filter(a => a > 60).length },
  ];

  // Satisfação por faixa etária
  const satisfactionByAge = [
    { ageGroup: '18-25', avgScore: 0, count: 0 },
    { ageGroup: '26-35', avgScore: 0, count: 0 },
    { ageGroup: '36-45', avgScore: 0, count: 0 },
    { ageGroup: '46-60', avgScore: 0, count: 0 },
    { ageGroup: '60+', avgScore: 0, count: 0 },
  ];

  evaluations.forEach(e => {
    const age = calculateAge(e.customer_birth_date);
    
    // Pular se idade inválida
    if (age === null) return;
    
    const avgScore = e.evaluation_answers.length > 0
      ? e.evaluation_answers.reduce((sum, a) => sum + a.score, 0) / e.evaluation_answers.length
      : 0;
    
    let index = -1;
    if (age >= 18 && age <= 25) index = 0;
    else if (age >= 26 && age <= 35) index = 1;
    else if (age >= 36 && age <= 45) index = 2;
    else if (age >= 46 && age <= 60) index = 3;
    else if (age > 60) index = 4;

    if (index >= 0) {
      satisfactionByAge[index].avgScore += avgScore;
      satisfactionByAge[index].count += 1;
    }
  });

  satisfactionByAge.forEach(group => {
    if (group.count > 0) {
      group.avgScore = group.avgScore / group.count;
    }
  });

  // Horários de pico
  const hourlyData = new Map<number, number>();
  evaluations.forEach(e => {
    const hour = new Date(e.evaluation_date).getHours();
    hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1);
  });
  const peakHours = Array.from(hourlyData.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }));

  // Avaliações por dia da semana
  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const weekdayData = Array.from({ length: 7 }, (_, i) => ({ 
    day: weekdayNames[i], 
    count: 0, 
    totalScore: 0 
  }));
  
  evaluations.forEach(e => {
    const day = new Date(e.evaluation_date).getDay();
    weekdayData[day].count++;
    const avgScore = e.evaluation_answers.length > 0
      ? e.evaluation_answers.reduce((sum, a) => sum + a.score, 0) / e.evaluation_answers.length
      : 0;
    weekdayData[day].totalScore += avgScore;
  });

  const weekdayStats = weekdayData.map(d => ({
    day: d.day,
    count: d.count,
    avgScore: d.count > 0 ? d.totalScore / d.count : 0,
  }));

  // Avaliações negativas recentes (últimas 24h com nota < 3)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const recentNegative = evaluations.filter(e => {
    const evalDate = new Date(e.evaluation_date);
    const avgScore = e.evaluation_answers.length > 0
      ? e.evaluation_answers.reduce((sum, a) => sum + a.score, 0) / e.evaluation_answers.length
      : 0;
    return evalDate >= yesterday && avgScore < 3;
  }).map(e => ({
    ...e,
    avgScore: e.evaluation_answers.length > 0
      ? e.evaluation_answers.reduce((sum, a) => sum + a.score, 0) / e.evaluation_answers.length
      : 0,
  }));

  // Clientes VIP (recorrentes)
  const customerFrequency = new Map<string, { count: number; evaluations: any[] }>();
  evaluations.forEach(e => {
    const key = e.customer_whatsapp;
    if (!customerFrequency.has(key)) {
      customerFrequency.set(key, { count: 0, evaluations: [] });
    }
    const data = customerFrequency.get(key)!;
    data.count++;
    data.evaluations.push(e);
  });

  const vipCustomers = Array.from(customerFrequency.entries())
    .filter(([_, data]) => data.count > 1)
    .map(([phone, data]) => {
      const allScores = data.evaluations.flatMap(e => 
        e.evaluation_answers.map((a: any) => a.score)
      );
      const avgScore = allScores.length > 0
        ? allScores.reduce((sum: number, s: number) => sum + s, 0) / allScores.length
        : 0;
      
      return {
        customer_name: data.evaluations[0].customer_name,
        customer_whatsapp: phone,
        evaluation_count: data.count,
        avgScore,
        last_evaluation: data.evaluations[0].evaluation_date,
      };
    })
    .sort((a, b) => b.evaluation_count - a.evaluation_count);

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
    avgAge,
    ageDistribution,
    satisfactionByAge,
    peakHours,
    weekdayStats,
    recentNegative,
    vipCustomers,
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
