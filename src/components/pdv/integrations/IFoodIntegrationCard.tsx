import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExternalLink, CheckCircle2, RefreshCw } from "lucide-react";
import { useIFoodIntegration } from "@/hooks/use-ifood-integration";
import { IFoodConnectionDialog } from "@/components/pdv/settings/IFoodConnectionDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function IFoodIntegrationCard() {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const { settings, isLoading, isConnected, disconnectIFood, updateSettings, syncReviews } = useIFoodIntegration();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                iFood
                {isConnected ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Conectado
                  </Badge>
                ) : (
                  <Badge variant="secondary">Desconectado</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Receba pedidos do iFood diretamente no seu PDV
              </p>
            </div>
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnectIFood.mutate()}
                disabled={disconnectIFood.isPending}
              >
                {disconnectIFood.isPending ? "Desconectando..." : "Desconectar"}
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowConnectionDialog(true)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && settings?.ifood_merchant_id && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                ID do Estabelecimento: <span className="font-mono">{settings.ifood_merchant_id}</span>
              </p>
              {settings.ifood_token_expires_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Token expira em: {new Date(settings.ifood_token_expires_at).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}

          {isConnected && (
            <div className="space-y-3">
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

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>• Sincronização automática de cardápio</p>
            <p>• Recebimento de pedidos em tempo real</p>
            <p>• Atualização de status automaticamente</p>
          </div>
        </CardContent>
      </Card>

      <IFoodConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
      />
    </>
  );
}
