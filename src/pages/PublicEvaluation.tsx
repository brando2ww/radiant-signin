import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, ChevronLeft } from "lucide-react";
import {
  usePublicCampaign,
  usePublicCampaignQuestions,
  useSubmitCampaignEvaluation,
} from "@/hooks/use-evaluation-campaigns";

type Step = "info" | "question" | "nps" | "done";

export default function PublicEvaluation() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { data: campaign, isLoading: loadingCampaign } = usePublicCampaign(campaignId || "");
  const { data: questions, isLoading: loadingQuestions } = usePublicCampaignQuestions(campaignId || "");
  const submitEvaluation = useSubmitCampaignEvaluation();

  const [step, setStep] = useState<Step>("info");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [answers, setAnswers] = useState<Record<string, { score: number; comment: string }>>({});
  const [npsScore, setNpsScore] = useState<number | null>(null);

  const bgColor = (campaign as any)?.background_color || "#f8fafc";
  const logoUrl = (campaign as any)?.logo_url;
  const welcomeMsg = (campaign as any)?.welcome_message;
  const thankYouMsg = (campaign as any)?.thank_you_message;

  if (loadingCampaign || loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bgColor }}>
        <p className="text-muted-foreground text-center">Esta campanha não está disponível.</p>
      </div>
    );
  }

  const totalQuestions = questions?.length || 0;
  const currentQuestion = questions?.[currentQuestionIdx];

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

  const goNextQuestion = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((i) => i + 1);
    } else {
      setStep("nps");
    }
  };

  const goPrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((i) => i - 1);
    } else {
      setStep("info");
    }
  };

  const handleSubmit = () => {
    if (!questions || !campaignId || npsScore === null) return;
    submitEvaluation.mutate(
      {
        campaignId,
        userId: campaign.user_id,
        customerName: name.trim(),
        customerWhatsapp: phone,
        customerBirthDate: birthDate,
        npsScore,
        answers: questions.map((q) => ({
          questionId: q.id,
          score: answers[q.id]?.score || 0,
          comment: answers[q.id]?.comment?.trim() || undefined,
        })),
      },
      { onSuccess: () => setStep("done") }
    );
  };

  // Total steps: info(1) + questions(N) + nps(1)
  const totalSteps = 1 + totalQuestions + 1;
  const currentStepNum =
    step === "info" ? 1 :
    step === "question" ? 2 + currentQuestionIdx :
    step === "nps" ? totalSteps : totalSteps;
  const progressPercent = step === "done" ? 100 : Math.round((currentStepNum / totalSteps) * 100);

  const Logo = logoUrl ? (
    <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-xl mx-auto" />
  ) : null;

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bgColor }}>
        <div className="text-center space-y-5 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Logo}
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Obrigado!</h1>
          <p className="text-muted-foreground leading-relaxed">
            {thankYouMsg || "Sua avaliação foi enviada com sucesso. Agradecemos pelo seu feedback!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {step === "info" && "Seus dados"}
            {step === "question" && `Pergunta ${currentQuestionIdx + 1} de ${totalQuestions}`}
            {step === "nps" && "Recomendação"}
          </p>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          {Logo}
          {step === "info" && (
            <>
              <h1 className="text-xl font-bold text-foreground">{campaign.name}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {welcomeMsg || campaign.description || "Conte-nos sobre sua experiência"}
              </p>
            </>
          )}
        </div>

        {/* Step: Info */}
        {step === "info" && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="eval-name">Nome *</Label>
              <Input
                id="eval-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                maxLength={100}
                className="h-12 rounded-xl"
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
                className="h-12 rounded-xl"
              />
            </div>
            <Button
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={!canSubmitInfo}
              onClick={() => { setStep("question"); setCurrentQuestionIdx(0); }}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step: Question (one at a time) */}
        {step === "question" && currentQuestion && (
          <div
            key={currentQuestion.id}
            className="bg-card rounded-2xl p-6 shadow-sm border space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <p className="text-base font-semibold text-foreground leading-snug">
              {currentQuestion.question_text}
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => {
                const score = answers[currentQuestion.id]?.score || 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSetScore(currentQuestion.id, s)}
                    className="p-1.5 transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        s <= score
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Comment if low score */}
            {(answers[currentQuestion.id]?.score || 0) > 0 &&
              (answers[currentQuestion.id]?.score || 0) <= 2 && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <Label className="text-sm text-muted-foreground">
                  O que aconteceu? (opcional)
                </Label>
                <Textarea
                  value={answers[currentQuestion.id]?.comment || ""}
                  onChange={(e) => handleSetComment(currentQuestion.id, e.target.value)}
                  placeholder="Conte-nos o que podemos melhorar..."
                  maxLength={500}
                  className="min-h-[80px] rounded-xl"
                />
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl px-4"
                onClick={goPrevQuestion}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl text-base font-semibold"
                disabled={!(answers[currentQuestion.id]?.score > 0)}
                onClick={goNextQuestion}
              >
                {currentQuestionIdx < totalQuestions - 1 ? "Próxima" : "Continuar"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: NPS */}
        {step === "nps" && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-foreground">
                De 0 a 10, o quanto você indicaria nosso estabelecimento para um amigo?
              </p>
              <p className="text-xs text-muted-foreground">Selecione uma nota abaixo</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNpsScore(n)}
                  className={`w-11 h-11 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                    npsScore === n
                      ? n <= 6
                        ? "bg-red-500 text-white border-red-500 shadow-md"
                        : n <= 8
                        ? "bg-yellow-500 text-white border-yellow-500 shadow-md"
                        : "bg-green-600 text-white border-green-600 shadow-md"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Nada provável</span>
              <span>Muito provável</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl px-4"
                onClick={() => {
                  setStep("question");
                  setCurrentQuestionIdx(totalQuestions - 1);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl text-base font-semibold"
                disabled={npsScore === null || submitEvaluation.isPending}
                onClick={handleSubmit}
              >
                {submitEvaluation.isPending ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
