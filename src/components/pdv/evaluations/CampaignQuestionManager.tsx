import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  useCampaignQuestions,
  useCreateCampaignQuestion,
  useUpdateCampaignQuestion,
  useDeleteCampaignQuestion,
} from "@/hooks/use-evaluation-campaigns";

interface Props {
  campaignId: string;
}

export function CampaignQuestionManager({ campaignId }: Props) {
  const [newQuestion, setNewQuestion] = useState("");
  const { data: questions, isLoading } = useCampaignQuestions(campaignId);
  const createQuestion = useCreateCampaignQuestion();
  const updateQuestion = useUpdateCampaignQuestion();
  const deleteQuestion = useDeleteCampaignQuestion();

  const handleAdd = () => {
    if (!newQuestion.trim()) return;
    createQuestion.mutate(
      {
        campaign_id: campaignId,
        question_text: newQuestion.trim(),
        order_position: (questions?.length || 0) + 1,
      },
      { onSuccess: () => setNewQuestion("") }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Digite uma nova pergunta..."
          maxLength={200}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!newQuestion.trim() || createQuestion.isPending} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                <span className="flex-1 text-sm">{q.question_text}</span>
                <Switch
                  checked={q.is_active}
                  onCheckedChange={(checked) =>
                    updateQuestion.mutate({ id: q.id, campaign_id: campaignId, is_active: checked })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteQuestion.mutate({ id: q.id, campaign_id: campaignId })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma pergunta adicionada. Adicione perguntas para que seus clientes possam avaliar.
        </p>
      )}
    </div>
  );
}
