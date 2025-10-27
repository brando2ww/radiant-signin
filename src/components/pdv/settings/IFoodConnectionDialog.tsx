import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Info } from "lucide-react";
import { useIFoodIntegration } from "@/hooks/use-ifood-integration";

interface IFoodConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IFoodConnectionDialog({ open, onOpenChange }: IFoodConnectionDialogProps) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [authCode, setAuthCode] = useState("");
  const { connectIFood } = useIFoodIntegration();

  const handleConnect = async () => {
    if (!clientId || !clientSecret || !authCode) {
      return;
    }

    await connectIFood.mutateAsync({ clientId, clientSecret, code: authCode });
    onOpenChange(false);
    setClientId("");
    setClientSecret("");
    setAuthCode("");
  };

  const handleGetCode = () => {
    if (!clientId) {
      return;
    }

    const redirectUri = `${window.location.origin}/pdv/settings`;
    const authUrl = `https://merchant-api.ifood.com.br/authentication/v1.0/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.open(authUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conectar iFood</DialogTitle>
          <DialogDescription>
            Configure sua integração com o iFood para receber pedidos automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Passos para conectar:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Obtenha suas credenciais no Portal do Desenvolvedor iFood</li>
                <li>Insira o Client ID abaixo e clique em "Obter Código"</li>
                <li>Autorize o acesso na página do iFood que será aberta</li>
                <li>Cole o código retornado e insira o Client Secret</li>
                <li>Clique em "Conectar"</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="seu-client-id"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGetCode}
              disabled={!clientId}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Obter Código de Autorização
            </Button>

            <div className="space-y-2">
              <Label htmlFor="authCode">Código de Autorização *</Label>
              <Input
                id="authCode"
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Cole aqui o código retornado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="seu-client-secret"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!clientId || !clientSecret || !authCode || connectIFood.isPending}
            >
              {connectIFood.isPending ? "Conectando..." : "Conectar"}
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Precisa de ajuda?</strong> Acesse o{" "}
              <a
                href="https://developer.ifood.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Portal do Desenvolvedor iFood
              </a>{" "}
              para criar suas credenciais de API.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
