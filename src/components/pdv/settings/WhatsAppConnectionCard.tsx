import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, ExternalLink, Smartphone, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useWhatsAppConnection } from "@/hooks/use-whatsapp-connection";
import { WhatsAppQRCodeDialog } from "./WhatsAppQRCodeDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function WhatsAppConnectionCard() {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const {
    connection,
    isLoading,
    isConnected,
    isDisconnecting,
    disconnect
  } = useWhatsAppConnection();

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">WhatsApp Business</h3>
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
              {isConnected 
                ? "Seu WhatsApp está conectado ao sistema"
                : "Conecte seu WhatsApp para enviar cotações e pedidos diretamente pelo sistema"
              }
            </p>
          </div>
          
          {isConnected ? (
            <Button
              variant="outline"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desconectando...
                </>
              ) : (
                "Desconectar"
              )}
            </Button>
          ) : (
            <Button onClick={() => setShowQRDialog(true)} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Conectar
            </Button>
          )}
        </div>

        {isConnected && connection && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={connection.profile_picture_url || undefined} />
              <AvatarFallback>
                <Smartphone className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{connection.profile_name || 'WhatsApp'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {connection.phone_number && (
                  <span>+{connection.phone_number}</span>
                )}
                {connection.connected_at && (
                  <>
                    <span>•</span>
                    <span>
                      Conectado em {format(new Date(connection.connected_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          • Envie cotações para fornecedores via WhatsApp<br />
          • Receba confirmações de pedidos<br />
          • Comunique-se diretamente pelo sistema
        </div>
      </div>

      <WhatsAppQRCodeDialog 
        open={showQRDialog} 
        onOpenChange={setShowQRDialog} 
      />
    </>
  );
}
