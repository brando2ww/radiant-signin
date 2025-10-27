import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, QrCode as QrCodeIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const PublicMenuLink = () => {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);
  
  const publicUrl = user ? `${window.location.origin}/cardapio/${user.id}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleOpenLink = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Link Público do Cardápio</CardTitle>
          <CardDescription>
            Compartilhe este link com seus clientes para que eles possam fazer pedidos online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={publicUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={handleOpenLink} variant="outline" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowQR(true)} className="flex-1">
              <QrCodeIcon className="h-4 w-4 mr-2" />
              Ver QR Code
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Como compartilhar:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Envie o link direto pelo WhatsApp</li>
              <li>Coloque o QR Code em cardápios físicos</li>
              <li>Compartilhe nas redes sociais</li>
              <li>Adicione ao Instagram Bio</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code do Cardápio</DialogTitle>
            <DialogDescription>
              Seus clientes podem escanear este código para acessar seu cardápio
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={publicUrl} size={256} level="H" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Salve a imagem ou imprima para usar em seus materiais
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};