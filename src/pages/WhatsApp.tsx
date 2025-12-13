import { useEffect, useState } from "react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MessageCircle, Phone, CheckCircle2, RefreshCw, Shield } from "lucide-react";
import { useWhatsAppVerification } from "@/hooks/use-whatsapp-verification";
import { cn } from "@/lib/utils";

export default function WhatsApp() {
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

  useEffect(() => {
    checkVerificationStatus();
  }, []);

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
    // Add country code if not present
    const fullNumber = digits.length === 11 ? `55${digits}` : `55${digits}`;
    await sendCode(fullNumber);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) return;
    await verifyCode(code);
  };

  const handleResend = () => {
    setCode("");
    reset();
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <ResponsivePageHeader
        title="Verificação de WhatsApp"
        description="Verifique seu número de WhatsApp para receber notificações"
      />

      <div className="max-w-md mx-auto">
        {isVerified ? (
          // Verified state
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-green-600">WhatsApp Verificado!</CardTitle>
              <CardDescription>
                Seu número está verificado e pronto para receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-lg font-medium">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>+{verifiedPhone}</span>
              </div>
              <Button variant="outline" onClick={handleResend} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar outro número
              </Button>
            </CardContent>
          </Card>
        ) : codeSent ? (
          // Code verification step
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Digite o código</CardTitle>
              <CardDescription>
                Enviamos um código de 6 dígitos para seu WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {timeLeft !== null && timeLeft > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Código expira em{" "}
                  <span className={cn("font-medium", timeLeft < 60 && "text-destructive")}>
                    {formatTimeLeft(timeLeft)}
                  </span>
                </p>
              )}

              {timeLeft === 0 && (
                <p className="text-center text-sm text-destructive">
                  Código expirado
                </p>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || isVerifying || timeLeft === 0}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verificar código
                    </>
                  )}
                </Button>

                <Button variant="ghost" onClick={handleResend} className="w-full">
                  Usar outro número
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Phone input step
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Verificar WhatsApp</CardTitle>
              <CardDescription>
                Digite seu número de WhatsApp para receber o código de verificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de WhatsApp</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground text-sm">
                    +55
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isSending}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Informe seu número com DDD
                </p>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={phone.replace(/\D/g, "").length < 10 || isSending}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar código
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
