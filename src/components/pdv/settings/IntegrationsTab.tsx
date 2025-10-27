import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useIFoodIntegration } from "@/hooks/use-ifood-integration";
import { IFoodConnectionDialog } from "./IFoodConnectionDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationsTab() {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const { settings, isLoading, isConnected, disconnectIFood, updateSettings } = useIFoodIntegration();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integrações Disponíveis
          </CardTitle>
          <CardDescription>
            Conecte seu PDV com plataformas de delivery e outras ferramentas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">iFood</h3>
                  {isConnected ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Desconectado</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba pedidos do iFood diretamente no seu PDV
                </p>
                {isConnected && settings?.ifood_merchant_id && (
                  <p className="text-xs text-muted-foreground">
                    ID do Estabelecimento: {settings.ifood_merchant_id}
                  </p>
                )}
              </div>
              {isConnected ? (
                <Button
                  variant="outline"
                  onClick={() => disconnectIFood.mutate()}
                  disabled={disconnectIFood.isPending}
                >
                  {disconnectIFood.isPending ? "Desconectando..." : "Desconectar"}
                </Button>
              ) : (
                <Button onClick={() => setShowConnectionDialog(true)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Conectar
                </Button>
              )}
            </div>

            {isConnected && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ifood-auto-accept" className="text-sm">
                    Aceitar pedidos automaticamente
                  </Label>
                  <Switch
                    id="ifood-auto-accept"
                    checked={settings?.ifood_auto_accept || false}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({ ifood_auto_accept: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ifood-sync-menu" className="text-sm">
                    Sincronizar cardápio automaticamente
                  </Label>
                  <Switch
                    id="ifood-sync-menu"
                    checked={settings?.ifood_sync_menu || false}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({ ifood_sync_menu: checked })
                    }
                  />
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              • Sincronização automática de cardápio<br />
              • Recebimento de pedidos em tempo real<br />
              • Atualização de status automaticamente
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Rappi</h3>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integre com a plataforma Rappi para receber pedidos
                </p>
              </div>
              <Button disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Uber Eats</h3>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba pedidos do Uber Eats no seu sistema
                </p>
              </div>
              <Button disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Delivery Próprio</h3>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sistema de delivery integrado da Velara
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/delivery" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Configurar
                </a>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              • Cardápio online personalizável<br />
              • Gestão completa de pedidos<br />
              • Link público para compartilhar
            </div>
          </div>
        </CardContent>
      </Card>

      <IFoodConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
      />
    </div>
  );
}
