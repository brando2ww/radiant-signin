import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { StarRating } from "@/components/evaluations/StarRating";
import { usePublicQuestions, useNpsEnabled, useSubmitEvaluation } from "@/hooks/use-public-evaluation";
import { usePublicBusinessSettings } from "@/hooks/use-business-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Step = "loading" | "welcome" | "identification" | "questions" | "nps" | "thanks";

const PublicEvaluation = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data: questions, isLoading: questionsLoading } = usePublicQuestions(userId!);
  const { data: npsEnabled, isLoading: npsLoading } = useNpsEnabled(userId!);
  const { settings: businessSettings, loading: businessLoading } = usePublicBusinessSettings(userId!);
  const submitEvaluation = useSubmitEvaluation();

  const [step, setStep] = useState<Step>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Dados do cliente
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerBirthDate, setCustomerBirthDate] = useState("");

  // Respostas
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [npsScore, setNpsScore] = useState<number | null>(null);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  };

  const handleStartEvaluation = () => {
    setStep("identification");
  };

  const handleIdentificationSubmit = () => {
    if (!customerName || !customerWhatsapp || !customerBirthDate) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    setStep("questions");
  };

  const handleAnswerQuestion = (score: number) => {
    if (!questions) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.id]: score });
  };

  const handleNextQuestion = () => {
    if (!questions) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!answers[currentQuestion.id]) {
      alert("Por favor, selecione uma avaliação");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (npsEnabled) {
        setStep("nps");
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (npsEnabled && step === "nps" && npsScore === null) {
      alert("Por favor, selecione uma nota NPS");
      return;
    }

    const answersArray = Object.entries(answers).map(([questionId, score]) => ({
      questionId,
      score,
    }));

    await submitEvaluation.mutateAsync({
      userId: userId!,
      customerName,
      customerWhatsapp,
      customerBirthDate,
      npsScore,
      answers: answersArray,
    });

    setStep("thanks");
  };

  if (questionsLoading || npsLoading || step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Avaliação não disponível</CardTitle>
            <CardDescription>
              Esta avaliação não está configurada ou não está disponível no momento.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: businessSettings 
          ? `linear-gradient(135deg, ${businessSettings.primary_color}15 0%, ${businessSettings.secondary_color}15 100%)`
          : "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--background)) 100%)"
      }}
    >
      <div className="max-w-lg w-full">
        {/* Logo e nome do estabelecimento */}
        {businessSettings && (
          <div className="text-center mb-6">
            {businessSettings.logo_url && (
              <img 
                src={businessSettings.logo_url} 
                alt={businessSettings.business_name}
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
            )}
            <h2 className="text-2xl font-bold">{businessSettings.business_name}</h2>
            {businessSettings.business_slogan && (
              <p className="text-muted-foreground">{businessSettings.business_slogan}</p>
            )}
          </div>
        )}

        {step === "welcome" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">
                {businessSettings?.welcome_message || "Olá! Queremos ouvir você 😊"}
              </CardTitle>
              <CardDescription className="text-base">
                {businessSettings?.business_description || "Sua opinião é muito importante para nós. Leva apenas alguns minutos!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartEvaluation} 
                className="w-full" 
                size="lg"
                style={businessSettings ? {
                  backgroundColor: businessSettings.primary_color
                } : undefined}
              >
                Começar Avaliação
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "identification" && (
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
              <CardDescription>Por favor, preencha seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(formatPhone(e.target.value))}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Data de Nascimento *</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={customerBirthDate}
                  onChange={(e) => setCustomerBirthDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <Button onClick={handleIdentificationSubmit} className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "questions" && (
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pergunta {currentQuestionIndex + 1} de {questions.length}
                </p>
                <Progress value={progress} />
              </div>
              <CardTitle className="text-2xl mt-4">{currentQuestion.question_text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating
                value={answers[currentQuestion.id] || 0}
                onChange={handleAnswerQuestion}
              />

              <div className="flex gap-2">
                {currentQuestionIndex > 0 && (
                  <Button variant="outline" onClick={handlePreviousQuestion}>
                    Anterior
                  </Button>
                )}
                <Button onClick={handleNextQuestion} className="flex-1">
                  {currentQuestionIndex < questions.length - 1 ? "Próxima" : npsEnabled ? "Continuar" : "Finalizar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "nps" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">De 0 a 10, você indicaria este lugar para alguém?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <Button
                    key={i}
                    variant={npsScore === i ? "default" : "outline"}
                    onClick={() => setNpsScore(i)}
                    className={cn(
                      "aspect-square p-0",
                      i <= 6 && npsScore === i && "bg-destructive hover:bg-destructive/90",
                      i >= 7 && i <= 8 && npsScore === i && "bg-yellow-500 hover:bg-yellow-500/90",
                      i >= 9 && npsScore === i && "bg-green-500 hover:bg-green-500/90"
                    )}
                  >
                    {i}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Nunca recomendaria</span>
                <span>Com certeza</span>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={submitEvaluation.isPending}>
                Enviar Avaliação
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "thanks" && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle 
                className="w-20 h-20 mx-auto" 
                style={{
                  color: businessSettings?.primary_color || "hsl(var(--primary))"
                }}
              />
              <div>
                <h1 className="text-3xl font-bold">Obrigado! 🎉</h1>
                <p className="text-muted-foreground mt-2">
                  {businessSettings?.thank_you_message || "Sua avaliação foi registrada com sucesso. Esperamos vê-lo novamente em breve!"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicEvaluation;
