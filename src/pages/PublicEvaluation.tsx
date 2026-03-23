import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Star, CheckCircle2, ClipboardList, BarChart3, User } from "lucide-react";
import {
  usePublicCampaign,
  usePublicCampaignQuestions,
  useSubmitCampaignEvaluation,
} from "@/hooks/use-evaluation-campaigns";

export default function PublicEvaluation() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { data: campaign, isLoading: loadingCampaign } = usePublicCampaign(campaignId || "");
  const { data: questions, isLoading: loadingQuestions } = usePublicCampaignQuestions(campaignId || "");
  const submitEvaluation = useSubmitCampaignEvaluation();

  const [done, setDone] = useState(false);
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

  const allQuestionsAnswered = questions?.every((q) => answers[q.id]?.score > 0) ?? true;
  const canSubmit =
    name.trim() &&
    phone.replace(/\D/g, "").length >= 10 &&
    birthDate &&
    allQuestionsAnswered &&
    npsScore !== null;

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
      { onSuccess: () => setDone(true) }
    );
  };

  const Logo = logoUrl ? (
    <img src={logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded-2xl mx-auto shadow-sm" />
  ) : null;

  if (done) {
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
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 pb-2">
          {Logo}
          <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {welcomeMsg || campaign.description || "Conte-nos sobre sua experiência"}
          </p>
        </div>

        {/* Section: Dados do Cliente */}
        <section className="bg-card rounded-2xl p-6 shadow-sm border space-y-4">
          <div className="flex items-center gap-2 text-foreground mb-1">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Seus Dados</h2>
          </div>
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
        </section>

        {/* Section: Perguntas */}
        {questions && questions.length > 0 && (
          <section className="bg-card rounded-2xl p-6 shadow-sm border space-y-6">
            <div className="flex items-center gap-2 text-foreground mb-1">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">Avaliação</h2>
            </div>

            {questions.map((q, idx) => {
              const score = answers[q.id]?.score || 0;
              return (
                <div key={q.id} className="space-y-3">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {idx + 1}. {q.question_text}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSetScore(q.id, s)}
                        className="p-1 transition-transform active:scale-90"
                      >
                        <Star
                          className={`h-9 w-9 transition-colors ${
                            s <= score
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {score > 0 && score <= 2 && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <Label className="text-xs text-muted-foreground">
                        O que aconteceu? (opcional)
                      </Label>
                      <Textarea
                        value={answers[q.id]?.comment || ""}
                        onChange={(e) => handleSetComment(q.id, e.target.value)}
                        placeholder="Conte-nos o que podemos melhorar..."
                        maxLength={500}
                        className="min-h-[70px] rounded-xl text-sm"
                      />
                    </div>
                  )}
                  {idx < questions.length - 1 && (
                    <div className="border-b border-border/50 pt-1" />
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Section: NPS */}
        <section className="bg-card rounded-2xl p-6 shadow-sm border space-y-4">
          <div className="flex items-center gap-2 text-foreground mb-1">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Recomendação</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            De 0 a 10, o quanto você indicaria nosso estabelecimento para um amigo?
          </p>
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
        </section>

        {/* Submit */}
        <Button
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-md"
          disabled={!canSubmit || submitEvaluation.isPending}
          onClick={handleSubmit}
        >
          {submitEvaluation.isPending ? "Enviando..." : "Enviar Avaliação"}
        </Button>

        <div className="h-4" />
      </div>
    </div>
  );
}
