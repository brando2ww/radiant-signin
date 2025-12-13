import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useWhatsAppVerification() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const sendCode = async (phone: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return false;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-code", {
        body: { phoneNumber: phone, userId: user.id },
      });

      if (error) throw error;

      if (data?.success) {
        setCodeSent(true);
        setPhoneNumber(phone);
        setExpiresAt(data.expiresAt);
        toast.success("Código enviado para seu WhatsApp!");
        return true;
      } else {
        throw new Error(data?.error || "Erro ao enviar código");
      }
    } catch (error: any) {
      console.error("Error sending code:", error);
      toast.error(error.message || "Erro ao enviar código");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (code: string) => {
    if (!user || !phoneNumber) {
      toast.error("Dados incompletos");
      return false;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-whatsapp-code", {
        body: { phoneNumber, code, userId: user.id },
      });

      if (error) throw error;

      if (data?.valid) {
        setIsVerified(true);
        toast.success("WhatsApp verificado com sucesso!");
        return true;
      } else {
        toast.error(data?.error || "Código inválido");
        return false;
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast.error(error.message || "Erro ao verificar código");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setCodeSent(false);
    setIsVerified(false);
    setPhoneNumber("");
    setExpiresAt(null);
  };

  const checkVerificationStatus = async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_verifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_verified", true)
        .order("verified_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsVerified(true);
        setPhoneNumber(data.phone_number);
      }

      return data;
    } catch (error) {
      console.error("Error checking verification status:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSending,
    isVerifying,
    codeSent,
    isVerified,
    phoneNumber,
    expiresAt,
    sendCode,
    verifyCode,
    reset,
    checkVerificationStatus,
  };
}
