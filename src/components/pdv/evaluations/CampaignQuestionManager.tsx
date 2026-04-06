import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, FileDown, X, Star, List, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import {
  useCampaignQuestions,
  useCreateCampaignQuestion,
  useUpdateCampaignQuestion,
  useDeleteCampaignQuestion,
} from "@/hooks/use-evaluation-campaigns";

const RESTAURANT_TEMPLATES: { text: string; type: string; options?: string[] }[] = [
  { text: "Como avalia a qualidade da comida?", type: "stars" },
  { text: "O atendimento foi satisfatório?", type: "stars" },
  { text: "O ambiente estava agradável?", type: "stars" },
  { text: "O tempo de espera foi adequado?", type: "stars" },
  { text: "A relação custo-benefício foi justa?", type: "stars" },
  { text: "A higiene do local estava adequada?", type: "stars" },
  {
    text: "Como conheceu nosso restaurante?",
    type: "single_choice",
    options: ["Instagram", "Indicação de amigos", "Google", "Passou na frente", "iFood/Delivery", "Outro"],
  },
  {
    text: "O que mais gostou?",
    type: "multiple_choice",
    options: ["Comida", "Atendimento", "Ambiente", "Preço", "Localização", "Rapidez"],
  },
];

const QUESTION_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  stars: { label: "Estrelas (1-5)", icon: <Star className="h-3.5 w-3.5" /> },
  single_choice: { label: "Escolha única", icon: <List className="h-3.5 w-3.5" /> },
  multiple_choice: { label: "Múltipla escolha", icon: <CheckSquare className="h-3.5 w-3.5" /> },
};

interface Props {
  campaignId: string;
}

export function CampaignQuestionManager({ campaignId }: Props) {
  const [newQuestion, setNewQuestion] = useState("");
  const [questionType, setQuestionType] = useState("stars");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const { data: questions, isLoading } = useCampaignQuestions(campaignId);
  const createQuestion = useCreateCampaignQuestion();
  const updateQuestion = useUpdateCampaignQuestion();
  const deleteQuestion = useDeleteCampaignQuestion();

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed || options.includes(trimmed)) return;
    setOptions((prev) => [...prev, trimmed]);
    setNewOption("");
  };

  const handleRemoveOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    if (!newQuestion.trim()) return;
    if (questionType !== "stars" && options.length < 2) {
      toast.error("Adicione pelo menos 2 opções para perguntas de escolha.");
      return;
    }
    createQuestion.mutate(
      {
        campaign_id: campaignId,
        question_text: newQuestion.trim(),
        order_position: (questions?.length || 0) + 1,
        question_type: questionType,
        options: questionType !== "stars" ? options : undefined,
      },
      {
        onSuccess: () => {
          setNewQuestion("");
          setQuestionType("stars");
          setOptions([]);
        },
      }
    );
  };

  const handleImportTemplate = async () => {
    const startPos = (questions?.length || 0) + 1;
    for (let i = 0; i < RESTAURANT_TEMPLATES.length; i++) {
      const t = RESTAURANT_TEMPLATES[i];
      createQuestion.mutate({
        campaign_id: campaignId,
        question_text: t.text,
        order_position: startPos + i,
        question_type: t.type,
        options: t.options,
      });
    }
    toast.success("Template de restaurante importado!");
  };

  const isChoiceType = questionType !== "stars";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Digite uma nova pergunta..."
            maxLength={200}
            onKeyDown={(e) => e.key === "Enter" && !isChoiceType && handleAdd()}
          />
          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger className="w-[180px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QUESTION_TYPE_LABELS).map(([value, { label, icon }]) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">{icon} {label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isChoiceType && (
          <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <p className="text-xs text-muted-foreground font-medium">Opções de resposta:</p>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs bg-background border rounded-full px-2.5 py-1"
                >
                  {opt}
                  <button onClick={() => handleRemoveOption(idx)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Adicionar opção..."
                maxLength={100}
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
              />
              <Button size="sm" variant="outline" onClick={handleAddOption} disabled={!newOption.trim()} className="h-8 shrink-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleAdd} disabled={!newQuestion.trim() || createQuestion.isPending} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
          <Button variant="outline" onClick={handleImportTemplate} disabled={createQuestion.isPending} className="gap-2">
            <FileDown className="h-4 w-4" /> Importar Template Restaurante
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((q, index) => {
            const typeInfo = QUESTION_TYPE_LABELS[(q as any).question_type || "stars"];
            const qOptions = (q as any).options as string[] | null;
            return (
              <Card key={q.id}>
                <CardContent className="py-3 px-4 space-y-1">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{q.question_text}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
                          {typeInfo?.icon} {typeInfo?.label}
                        </span>
                      </div>
                    </div>
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
                  </div>
                  {qOptions && qOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-14">
                      {qOptions.map((opt, i) => (
                        <span key={i} className="text-[10px] bg-muted/50 rounded-full px-2 py-0.5 text-muted-foreground">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma pergunta adicionada. Adicione perguntas para que seus clientes possam avaliar.
        </p>
      )}
    </div>
  );
}
