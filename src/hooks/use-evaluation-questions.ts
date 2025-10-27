import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EvaluationQuestion {
  id: string;
  user_id: string;
  question_text: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEvaluationQuestions = () => {
  return useQuery({
    queryKey: ["evaluation-questions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("evaluation_questions")
        .select("*")
        .eq("user_id", user.id)
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data as EvaluationQuestion[];
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar a maior order_position
      const { data: questions } = await supabase
        .from("evaluation_questions")
        .select("order_position")
        .eq("user_id", user.id)
        .order("order_position", { ascending: false })
        .limit(1);

      const nextPosition = questions && questions.length > 0 ? questions[0].order_position + 1 : 0;

      const { data, error } = await supabase
        .from("evaluation_questions")
        .insert({
          user_id: user.id,
          question_text: questionText,
          order_position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-questions"] });
      toast.success("Pergunta criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar pergunta: " + error.message);
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, question_text, is_active }: { id: string; question_text?: string; is_active?: boolean }) => {
      const updates: any = {};
      if (question_text !== undefined) updates.question_text = question_text;
      if (is_active !== undefined) updates.is_active = is_active;

      const { data, error } = await supabase
        .from("evaluation_questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-questions"] });
      toast.success("Pergunta atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar pergunta: " + error.message);
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("evaluation_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-questions"] });
      toast.success("Pergunta excluída!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir pergunta: " + error.message);
    },
  });
};

export const useReorderQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions: { id: string; order_position: number }[]) => {
      const updates = questions.map(q => 
        supabase
          .from("evaluation_questions")
          .update({ order_position: q.order_position })
          .eq("id", q.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-questions"] });
      toast.success("Ordem atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao reordenar: " + error.message);
    },
  });
};

export const useInitializeDefaultQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const defaultQuestions = [
        "Como foi o atendimento?",
        "Como está a limpeza?",
        "Você voltaria aqui?",
      ];

      const { error } = await supabase
        .from("evaluation_questions")
        .insert(
          defaultQuestions.map((text, index) => ({
            user_id: user.id,
            question_text: text,
            order_position: index,
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-questions"] });
    },
  });
};
