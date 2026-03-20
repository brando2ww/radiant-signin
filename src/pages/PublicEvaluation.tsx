import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle2 } from "lucide-react";
import {
  usePublicCampaign,
  usePublicCampaignQuestions,
  useSubmitCampaignEvaluation,
} from "@/hooks/use-evaluation-campaigns";

type Step = "info" | "questions" | "done";

export default function PublicEvaluation() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { data: campaign, isLoading: loadingCampaign } = usePublicCampaign(campaignId || "");
  const { data: questions, isLoading: loadingQuestions } = usePublicCampaignQuestions(campaignId || "");
  const submitEvaluation = useSubmitCampaignEvaluation();

  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [answers, setAnswers] = useState<Record<string, { score: number; comment: string }>>({});

  if (loadingCampaign || loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground text-center">Esta campanha não está disponível.</p>
      </div>
    );
  }

  const handleSetScore = (questionId: string, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], score, comment: prev[questionId]?.comment || "" },
    }));
  };

  const handleSetComment = (questionId: string, comment: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment },
    }));
  };

  const canSubmitInfo = name.trim() && phone.replace(/\D/g, "").length >= 10 && birthDate;
  const canSubmitAnswers = questions?.every((q) => answers[q.id]?.score > 0);

  const handleSubmit = () => {
    if (!questions || !campaignId) return;
    submitEvaluation.mutate(
      {
        campaignId,
        userId: campaign.user_id,
        customerName: name.trim(),
        customerWhatsapp: phone,
        customerBirthDate: birthDate,
        answers: questions.map((q) => ({
          questionId: q.id,
          score: answers[q.id]?.score || 0,
          comment: answers[q.id]?.comment?.trim() || undefined,
        })),
      },
      { onSuccess: () => setStep("done") }
    );
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Obrigado!</h1>
          <p className="text-muted-foreground">
            Sua avaliação foi enviada com sucesso. Agradecemos pelo seu feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-muted-foreground text-sm">{campaign.description}</p>
          )}
          {step === "info" && (
            <p className="text-sm text-muted-foreground">Conte-nos sobre sua experiência</p>
          )}
        </div>

        {step === "info" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eval-name">Nome *</Label>
                <Input
                  id="eval-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eval-phone">Telefone *</Label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eval-birth">Data de Nascimento *</Label>
                <Input
                  id="eval-birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={!canSubmitInfo}
                onClick={() => setStep("questions")}
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "questions" && questions && (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const answer = answers[q.id];
              const score = answer?.score || 0;
              return (
                <Card key={q.id}>
                  <CardContent className="pt-5 space-y-3">
                    <p className="text-sm font-medium">
                      {idx + 1}. {q.question_text}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSetScore(q.id, s)}
                          className="p-1 transition-transform active:scale-90"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              s <= score
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {score > 0 && score <= 2 && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          O que aconteceu? (opcional)
                        </Label>
                        <Textarea
                          value={answer?.comment || ""}
                          onChange={(e) => handleSetComment(q.id, e.target.value)}
                          placeholder="Conte-nos o que podemos melhorar..."
                          maxLength={500}
                          className="min-h-[60px]"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            <Button
              className="w-full"
              disabled={!canSubmitAnswers || submitEvaluation.isPending}
              onClick={handleSubmit}
            >
              {submitEvaluation.isPending ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
