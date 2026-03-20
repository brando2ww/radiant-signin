import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { useCampaignResponses } from "@/hooks/use-evaluation-campaigns";

interface Props {
  campaignId: string;
}

export function CampaignResponses({ campaignId }: Props) {
  const { data: responses, isLoading } = useCampaignResponses(campaignId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando respostas...</p>;

  if (!responses || responses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma resposta recebida ainda. Compartilhe o link da campanha com seus clientes.
      </p>
    );
  }

  // Stats
  const allScores = responses.flatMap((r) =>
    (r.evaluation_answers as any[]).map((a: any) => a.score)
  );
  const avgScore = allScores.length > 0
    ? (allScores.reduce((s, v) => s + v, 0) / allScores.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{responses.length}</p>
            <p className="text-xs text-muted-foreground">Total de respostas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              {avgScore} <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </p>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Response list */}
      <div className="space-y-3">
        {responses.map((response) => (
          <Card key={response.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{response.customer_name}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(response.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{response.customer_whatsapp}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {(response.evaluation_answers as any[]).map((answer: any) => (
                <div key={answer.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {answer.evaluation_questions?.question_text || "Pergunta removida"}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= answer.score ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {answer.comment && (
                    <div className="flex items-start gap-1.5 text-xs bg-muted/50 p-2 rounded">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                      <span>{answer.comment}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
