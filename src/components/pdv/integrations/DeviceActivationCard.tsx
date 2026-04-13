import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, Loader2, TabletSmartphone, Copy, AlertCircle } from "lucide-react";

interface DeviceConfig {
  id: string;
  user_id: string;
  activation_token: string;
  activated_at: string;
  is_active: boolean;
}

export function DeviceActivationCard() {
  const { user } = useAuth();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeDevice, setActiveDevice] = useState<DeviceConfig | null>(null);

  useEffect(() => {
    if (user) checkExistingDevice();
  }, [user]);

  const checkExistingDevice = async () => {
    setChecking(true);
    try {
      const { data, error } = await (supabase as any)
        .from("pdv_device_config")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!error && data) {
        setActiveDevice(data as DeviceConfig);
      }
    } catch (err) {
      console.error("Erro ao verificar dispositivo:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleValidateToken = async () => {
    const cleanToken = token.trim().toUpperCase();
    if (cleanToken.length !== 12) {
      toast.error("O token deve ter exatamente 12 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("pdv_device_config")
        .select("*")
        .eq("activation_token", cleanToken)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        toast.error("Erro ao validar token.");
        return;
      }

      if (!data) {
        toast.error("Token inválido ou inexistente.");
        return;
      }

      const device = data as DeviceConfig;

      if (device.user_id !== user!.id) {
        toast.error("Este token não pertence à sua conta.");
        return;
      }

      setActiveDevice(device);
      setToken("");
      toast.success("Dispositivo ativado com sucesso!");
    } catch (err) {
      toast.error("Erro inesperado ao validar token.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  if (checking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TabletSmartphone className="h-4 w-4" />
              Status do Dispositivo
            </span>
            <Badge
              variant={activeDevice ? "default" : "secondary"}
              className={activeDevice
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : ""
              }
            >
              {activeDevice ? "Ativo" : "Não configurado"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDevice ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Dispositivo vinculado e ativo</span>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <span className="text-muted-foreground">Token</span>
                  <span className="flex items-center gap-2 font-mono font-medium">
                    {activeDevice.activation_token}
                    <button
                      onClick={() => copyToClipboard(activeDevice.activation_token)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <span className="text-muted-foreground">Ativado em</span>
                  <span className="font-medium">
                    {new Date(activeDevice.activated_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Nenhum dispositivo vinculado. Cole o token de ativação abaixo.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activation Form */}
      {!activeDevice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ativar Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cole o código de ativação de 12 caracteres gerado no painel administrativo.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: A1B2C3D4E5F6"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
                className="font-mono tracking-widest uppercase"
                maxLength={12}
              />
              <Button onClick={handleValidateToken} disabled={loading || token.length !== 12}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar Token"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {token.length}/12 caracteres
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
