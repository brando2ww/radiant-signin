import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EvaluationCampaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignQuestion {
  id: string;
  campaign_id: string;
  question_text: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithStats extends EvaluationCampaign {
  total_responses: number;
}

export const useEvaluationCampaigns = () => {
  return useQuery({
    queryKey: ["evaluation-campaigns"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("evaluation_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Count responses per campaign
      const campaigns: CampaignWithStats[] = [];
      for (const campaign of data) {
        const { count } = await supabase
          .from("customer_evaluations")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", campaign.id);

        campaigns.push({
          ...campaign,
          total_responses: count || 0,
        });
      }

      return campaigns;
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: campaign, error } = await supabase
        .from("evaluation_campaigns")
        .insert({ user_id: user.id, name: data.name, description: data.description || null })
        .select()
        .single();

      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-campaigns"] });
      toast.success("Campanha criada com sucesso!");
    },
    onError: (e: Error) => toast.error("Erro ao criar campanha: " + e.message),
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; is_active?: boolean; logo_url?: string | null; background_color?: string; welcome_message?: string | null; thank_you_message?: string | null; roulette_enabled?: boolean; wheel_primary_color?: string; wheel_secondary_color?: string; roulette_cooldown_hours?: number }) => {
      const { error } = await supabase
        .from("evaluation_campaigns")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-campaigns"] });
      toast.success("Campanha atualizada!");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("evaluation_campaigns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-campaigns"] });
      toast.success("Campanha excluída!");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
};

// Campaign Questions
export const useCampaignQuestions = (campaignId: string) => {
  return useQuery({
    queryKey: ["campaign-questions", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_campaign_questions")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as CampaignQuestion[];
    },
    enabled: !!campaignId,
  });
};

export const useCreateCampaignQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { campaign_id: string; question_text: string; order_position: number }) => {
      const { error } = await supabase
        .from("evaluation_campaign_questions")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-questions", vars.campaign_id] });
      toast.success("Pergunta adicionada!");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
};

export const useUpdateCampaignQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaign_id, ...data }: { id: string; campaign_id: string; question_text?: string; is_active?: boolean; order_position?: number }) => {
      const { error } = await supabase
        .from("evaluation_campaign_questions")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      return campaign_id;
    },
    onSuccess: (campaignId) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-questions", campaignId] });
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
};

export const useDeleteCampaignQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaign_id }: { id: string; campaign_id: string }) => {
      const { error } = await supabase
        .from("evaluation_campaign_questions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return campaign_id;
    },
    onSuccess: (campaignId) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-questions", campaignId] });
      toast.success("Pergunta removida!");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
};

// Campaign Responses
export const useCampaignResponses = (campaignId: string) => {
  return useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      // Fetch responses with answers
      const { data, error } = await supabase
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
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch questions for this campaign to map question_id -> question_text
      const { data: questions } = await supabase
        .from("evaluation_campaign_questions")
        .select("id, question_text")
        .eq("campaign_id", campaignId);

      const questionMap = new Map((questions || []).map(q => [q.id, q.question_text]));

      // Enrich answers with question_text
      return (data || []).map(response => ({
        ...response,
        evaluation_answers: ((response.evaluation_answers as any[]) || []).map((answer: any) => ({
          ...answer,
          evaluation_campaign_questions: {
            question_text: questionMap.get(answer.question_id) || "Pergunta não encontrada",
          },
        })),
      }));
    },
    enabled: !!campaignId,
  });
};

// Public hooks (no auth)
export const usePublicCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: ["public-campaign", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as EvaluationCampaign;
    },
    enabled: !!campaignId,
  });
};

export const usePublicCampaignQuestions = (campaignId: string) => {
  return useQuery({
    queryKey: ["public-campaign-questions", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_campaign_questions")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("is_active", true)
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as CampaignQuestion[];
    },
    enabled: !!campaignId,
  });
};

export const useSubmitCampaignEvaluation = () => {
  return useMutation({
    mutationFn: async (data: {
      campaignId: string;
      userId: string;
      customerName: string;
      customerWhatsapp: string;
      customerBirthDate: string;
      answers: { questionId: string; score: number; comment?: string }[];
      npsScore: number;
    }) => {
      const evaluationId = crypto.randomUUID();

      const { error: evalError } = await supabase
        .from("customer_evaluations")
        .insert({
          id: evaluationId,
          user_id: data.userId,
          customer_name: data.customerName,
          customer_whatsapp: data.customerWhatsapp,
          customer_birth_date: data.customerBirthDate,
          campaign_id: data.campaignId,
          nps_score: data.npsScore,
        });

      if (evalError) throw evalError;

      const answers = data.answers.map((a) => ({
        evaluation_id: evaluationId,
        question_id: a.questionId,
        score: a.score,
        comment: a.comment || null,
      }));

      const { error: answersError } = await supabase
        .from("evaluation_answers")
        .insert(answers);

      if (answersError) throw answersError;

      return { id: evaluationId };
    },
    onSuccess: () => toast.success("Avaliação enviada com sucesso!"),
    onError: (e: Error) => toast.error("Erro ao enviar avaliação: " + e.message),
  });
};
