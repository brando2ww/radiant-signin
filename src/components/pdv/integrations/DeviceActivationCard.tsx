import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, Loader2, TabletSmartphone, Copy, AlertCircle, KeyRound } from "lucide-react";

interface DeviceConfig {
  id: string;
  user_id: string;
  activation_token: string;
  activated_at: string;
  is_active: boolean;
}

const generateToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export function DeviceActivationCard() {
  const { user } = useAuth();
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

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const token = generateToken();
      const { data, error } = await (supabase as any)
        .from("pdv_device_config")
        .insert({
          user_id: user!.id,
          activation_token: token,
          is_active: true,
          activated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast.error("Erro ao gerar código de ativação.");
        console.error(error);
        return;
      }

      setActiveDevice(data as DeviceConfig);
      toast.success("Código de ativação gerado com sucesso!");
    } catch (err) {
      toast.error("Erro inesperado ao gerar código.");
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
                  <span className="text-muted-foreground">Código de ativação</span>
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
                  <span className="text-muted-foreground">Gerado em</span>
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
              <p className="text-xs text-muted-foreground mt-2">
                Cole este código no sistema da maquininha para vincular o dispositivo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Nenhum dispositivo vinculado. Gere um código de ativação abaixo.</span>
              </div>
              <Button onClick={handleGenerateToken} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <KeyRound className="h-4 w-4 mr-2" />
                )}
                Gerar código de ativação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
