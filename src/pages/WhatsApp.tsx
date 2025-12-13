import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  RefreshCw, 
  Shield, 
  ChevronDown,
  Bell,
  HelpCircle,
  Clock,
  Send
} from "lucide-react";
import { useWhatsAppVerification } from "@/hooks/use-whatsapp-verification";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Steps configuration
const steps = [
  { id: 1, label: "Número", icon: Phone },
  { id: 2, label: "Código", icon: Shield },
  { id: 3, label: "Verificado", icon: CheckCircle2 },
];

// FAQ items
const faqItems = [
  {
    question: "Quanto tempo leva para receber o código?",
    answer: "O código é enviado instantaneamente. Se não receber em 30 segundos, verifique se o número está correto e se o WhatsApp está funcionando normalmente."
  },
  {
    question: "O código expirou, o que fazer?",
    answer: "Clique em 'Reenviar código' para receber um novo código de verificação. Cada código é válido por 10 minutos."
  },
  {
    question: "Posso usar o WhatsApp Business?",
    answer: "Sim! Você pode verificar qualquer número que tenha WhatsApp instalado, incluindo WhatsApp Business."
  },
];

export default function WhatsApp() {
  const navigate = useNavigate();
  const {
    isLoading,
    isSending,
    isVerifying,
    codeSent,
    isVerified,
    phoneNumber: verifiedPhone,
    expiresAt,
    sendCode,
    verifyCode,
    reset,
    checkVerificationStatus,
  } = useWhatsAppVerification();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [faqOpen, setFaqOpen] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Calculate current step
  const currentStep = isVerified ? 3 : codeSent ? 2 : 1;

  // Total time for code expiration (10 minutes = 600 seconds)
  const TOTAL_TIME = 600;

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  // Trigger confetti on verification success
  useEffect(() => {
    if (isVerified && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#25D366', '#128C7E', '#075E54', '#34B7F1'],
      });
    }
  }, [isVerified, hasTriggeredConfetti]);

  // Countdown timer for code expiration
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-submit when code is complete
  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    if (value.length === 6 && !isVerifying && timeLeft !== 0) {
      // Auto-submit after a brief delay for better UX
      setTimeout(() => {
        verifyCode(value);
      }, 300);
    }
  }, [isVerifying, timeLeft, verifyCode]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSendCode = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      return;
    }
    const fullNumber = digits.length === 11 ? `55${digits}` : `55${digits}`;
    const success = await sendCode(fullNumber);
    if (success) {
      setResendCooldown(60);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    const digits = phone.replace(/\D/g, "");
    const fullNumber = digits.length === 11 ? `55${digits}` : `55${digits}`;
    const success = await sendCode(fullNumber);
    if (success) {
      setResendCooldown(60);
      setCode("");
    }
  };

  const handleReset = () => {
    setCode("");
    setHasTriggeredConfetti(false);
    reset();
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft === null) return "bg-primary";
    if (timeLeft <= 30) return "bg-destructive";
    if (timeLeft <= 60) return "bg-yellow-500";
    return "bg-primary";
  };

  if (isLoading) {
    return (
      <AppLayout className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="space-y-6 p-4 md:p-6 lg:p-8">
      <ResponsivePageHeader
        title="Verificação de WhatsApp"
        description="Verifique seu número de WhatsApp para receber notificações"
      />

      <div className="max-w-md mx-auto space-y-6 mt-8 md:mt-12">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted 
                      ? "hsl(var(--primary))" 
                      : isCurrent 
                        ? "hsl(var(--primary) / 0.2)" 
                        : "hsl(var(--muted))",
                  }}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                    isCompleted && "text-primary-foreground",
                    isCurrent && "text-primary ring-2 ring-primary ring-offset-2 ring-offset-background",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "w-8 h-0.5 mx-1 transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step labels */}
        <div className="flex justify-between px-2">
          {steps.map((step) => (
            <span 
              key={step.id}
              className={cn(
                "text-xs font-medium transition-colors",
                currentStep >= step.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isVerified ? (
            // Verified state
            <motion.div
              key="verified"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-green-500/50 bg-green-500/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
                <CardHeader className="text-center pb-2 relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </motion.div>
                  <CardTitle className="text-green-600 text-xl">WhatsApp Verificado!</CardTitle>
                  <CardDescription>
                    Seu número está verificado e pronto para receber notificações.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6 relative">
                  <div className="flex items-center justify-center gap-2 text-lg font-medium bg-muted/50 rounded-lg py-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <span>+{verifiedPhone}</span>
                  </div>

                  {/* What you'll receive */}
                  <div className="bg-muted/30 rounded-lg p-4 text-left space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      O que você receberá:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Alertas de contas a vencer
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Resumo financeiro semanal
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Notificações de pedidos (Delivery)
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      onClick={() => navigate('/settings')} 
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Configurar notificações
                    </Button>
                    <Button variant="ghost" onClick={handleReset} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar outro número
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : codeSent ? (
            // Code verification step
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="text-center pb-2">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <Shield className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle>Digite o código</CardTitle>
                  <CardDescription>
                    Enviamos um código de 6 dígitos para seu WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer Progress Bar */}
                  {timeLeft !== null && timeLeft > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Tempo restante
                        </span>
                        <motion.span 
                          animate={timeLeft <= 30 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5, repeat: timeLeft <= 30 ? Infinity : 0 }}
                          className={cn(
                            "font-mono font-bold",
                            timeLeft <= 30 && "text-destructive",
                            timeLeft > 30 && timeLeft <= 60 && "text-yellow-500",
                            timeLeft > 60 && "text-primary"
                          )}
                        >
                          {formatTimeLeft(timeLeft)}
                        </motion.span>
                      </div>
                      <Progress 
                        value={(timeLeft / TOTAL_TIME) * 100} 
                        className={cn("h-2 transition-all", getTimerColor())}
                      />
                    </div>
                  )}

                  {timeLeft === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 text-destructive rounded-lg p-3 text-center text-sm font-medium"
                    >
                      Código expirado. Solicite um novo código.
                    </motion.div>
                  )}

                  {/* OTP Input */}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={handleCodeChange}
                      disabled={isVerifying || timeLeft === 0}
                      autoFocus
                    >
                      <InputOTPGroup className="gap-2 md:gap-3">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot 
                            key={index} 
                            index={index} 
                            className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl rounded-lg border-2 transition-all focus-within:ring-2 focus-within:ring-primary"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Auto-submit indicator */}
                  {code.length > 0 && code.length < 6 && (
                    <p className="text-center text-xs text-muted-foreground">
                      {6 - code.length} dígitos restantes
                    </p>
                  )}

                  {isVerifying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-primary"
                    >
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Verificando...</span>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    {/* Resend code button */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-muted-foreground">Não recebeu?</span>
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || isSending}
                        className="p-0 h-auto"
                      >
                        {resendCooldown > 0 ? (
                          <span className="text-muted-foreground">
                            Reenviar em {resendCooldown}s
                          </span>
                        ) : isSending ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Reenviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            Reenviar código
                          </>
                        )}
                      </Button>
                    </div>

                    <Button variant="ghost" onClick={handleReset} className="w-full">
                      Usar outro número
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Phone input step
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="text-center pb-2">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4"
                  >
                    <MessageCircle className="h-8 w-8 text-green-500" />
                  </motion.div>
                  <CardTitle>Verificar WhatsApp</CardTitle>
                  <CardDescription>
                    Digite seu número de WhatsApp para receber o código de verificação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Número de WhatsApp
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 border rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                        🇧🇷 +55
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={isSending}
                        className="flex-1 h-11"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Informe seu número com DDD. Ex: (11) 99999-9999
                    </p>
                  </div>

                  <Button
                    onClick={handleSendCode}
                    disabled={phone.replace(/\D/g, "").length < 10 || isSending}
                    className="w-full h-11 bg-green-600 hover:bg-green-700"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar código via WhatsApp
                      </>
                    )}
                  </Button>

                  {/* Info box */}
                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      Você receberá uma mensagem do nosso número oficial com um código de 6 dígitos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <Collapsible open={faqOpen} onOpenChange={setFaqOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Dúvidas frequentes
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                faqOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 pt-2"
            >
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-muted/50 rounded-lg p-4"
                >
                  <p className="font-medium text-sm mb-1">{item.question}</p>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </motion.div>
              ))}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </AppLayout>
  );
}
