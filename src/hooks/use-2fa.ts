import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function use2FA() {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [phoneLastDigits, setPhoneLastDigits] = useState<string | null>(null);

  const check2FARequired = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("security_settings")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      const security = data.security_settings as Record<string, unknown> | null;
      
      return security?.two_factor_enabled === true;
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      return false;
    }
  };

  const checkHasVerifiedWhatsApp = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_verifications")
        .select("id")
        .eq("user_id", userId)
        .eq("is_verified", true)
        .limit(1)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error("Error checking WhatsApp verification:", error);
      return false;
    }
  };

  const send2FACode = async (userId: string): Promise<boolean> => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-2fa-code", {
        body: { userId },
      });

      if (error) throw error;

      if (data?.success) {
        setCodeSent(true);
        setExpiresAt(data.expiresAt);
        setPhoneLastDigits(data.phoneLastDigits);
        return true;
      } else {
        throw new Error(data?.error || "Erro ao enviar código 2FA");
      }
    } catch (error: unknown) {
      console.error("Error sending 2FA code:", error);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const verify2FACode = async (userId: string, code: string): Promise<boolean> => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-2fa-code", {
        body: { userId, code },
      });

      if (error) throw error;

      return data?.valid === true;
    } catch (error: unknown) {
      console.error("Error verifying 2FA code:", error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setCodeSent(false);
    setExpiresAt(null);
    setPhoneLastDigits(null);
  };

  return {
    isSending,
    isVerifying,
    codeSent,
    expiresAt,
    phoneLastDigits,
    check2FARequired,
    checkHasVerifiedWhatsApp,
    send2FACode,
    verify2FACode,
    reset,
  };
}
