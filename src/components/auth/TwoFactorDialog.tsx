import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck, RefreshCw, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneLastDigits: string | null;
  expiresAt: string | null;
  isSending: boolean;
  isVerifying: boolean;
  onVerify: (code: string) => void;
  onResend: () => void;
  onCancel: () => void;
}

export function TwoFactorDialog({
  open,
  onOpenChange,
  phoneLastDigits,
  expiresAt,
  isSending,
  isVerifying,
  onVerify,
  onResend,
  onCancel,
}: TwoFactorDialogProps) {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Calculate time left from expiresAt
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleVerify = () => {
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResend = () => {
    setCode("");
    setResendCooldown(60);
    onResend();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (!timeLeft) return "text-muted-foreground";
    if (timeLeft < 60) return "text-destructive";
    if (timeLeft < 180) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Verificação em Duas Etapas</DialogTitle>
          <DialogDescription className="text-center">
            Enviamos um código de 6 dígitos para seu WhatsApp
            {phoneLastDigits && (
              <span className="block mt-1 font-medium text-foreground">
                ****{phoneLastDigits}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OTP Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
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
          </motion.div>

          {/* Timer */}
          {timeLeft !== null && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Código expira em{" "}
                <span className={`font-mono font-bold ${getTimerColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verificar Código
              </>
            )}
          </Button>

          {/* Resend */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Não recebeu o código?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isSending}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {resendCooldown > 0
                ? `Reenviar em ${resendCooldown}s`
                : "Reenviar código"}
            </Button>
          </div>

          {/* Cancel */}
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancelar
          </Button>

          {/* Help */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3 w-3" />
            <span>Verifique seu WhatsApp para receber o código</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
