import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, RefreshCw, Smartphone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWhatsAppConnection } from "@/hooks/use-whatsapp-connection";

interface WhatsAppQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppQRCodeDialog({ open, onOpenChange }: WhatsAppQRCodeDialogProps) {
  const {
    connection,
    isConnected,
    qrCode,
    isPolling,
    isGenerating,
    generateQRCode,
    stopPolling,
    setQrCode
  } = useWhatsAppConnection();

  const handleClose = () => {
    stopPolling();
    setQrCode(null);
    onOpenChange(false);
  };

  const handleGenerateNew = () => {
    setQrCode(null);
    generateQRCode();
  };

  // Connection success view
  if (isConnected || (connection?.connection_status === 'open')) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5 text-green-500" />
              WhatsApp Conectado
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-6">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>

            <p className="text-center text-lg font-medium">
              WhatsApp conectado com sucesso!
            </p>

            {connection && (
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={connection.profile_picture_url || undefined} />
                  <AvatarFallback>
                    <Smartphone className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{connection.profile_name || 'WhatsApp'}</p>
                  {connection.phone_number && (
                    <p className="text-sm text-muted-foreground">
                      +{connection.phone_number}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Concluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // QR Code view
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WhatsAppIcon className="h-5 w-5 text-green-500" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code Display */}
          <div className="relative flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed bg-yellow-400">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-background/80 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrCode ? (
              <img 
                src={`data:image/png;base64,${qrCode}`} 
                alt="QR Code WhatsApp" 
                className="h-full w-full object-contain p-2 mix-blend-multiply"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <WhatsAppIcon className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique para gerar</p>
              </div>
            )}
          </div>

          {/* Status and instructions */}
          {isPolling && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Aguardando conexão...</span>
            </div>
          )}

          {/* Instructions */}
          <div className="w-full space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium">Como conectar:</p>
            <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em <span className="font-medium">Configurações</span> → <span className="font-medium">Dispositivos conectados</span></li>
              <li>Toque em <span className="font-medium">Conectar um dispositivo</span></li>
              <li>Aponte a câmera para este QR Code</li>
            </ol>
          </div>

          {qrCode && (
            <p className="text-xs text-muted-foreground">
              O QR Code expira em 2 minutos
            </p>
          )}

          {/* Actions */}
          <div className="flex w-full gap-2">
            {!qrCode && !isGenerating && (
              <Button 
                onClick={() => generateQRCode()} 
                className="w-full gap-2"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Gerar QR Code
              </Button>
            )}
            
            {qrCode && (
              <Button 
                variant="outline" 
                onClick={handleGenerateNew}
                disabled={isGenerating}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar novo QR Code
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
