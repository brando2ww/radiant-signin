import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, ExternalLink, Wifi } from "lucide-react";
import { toast } from "sonner";

import getnetLogo from "@/assets/integrations/getnet.png";

export function GetnetIntegrationCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [sellerId, setSellerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [environment, setEnvironment] = useState("sandbox");
  const [connectionType, setConnectionType] = useState("cloud");
  const [autoCapture, setAutoCapture] = useState(true);
  const [terminalPix, setTerminalPix] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!sellerId.trim() || !clientId.trim() || !clientSecret.trim()) {
      toast.error("Preencha todas as credenciais");
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
      toast.success("Getnet conectada com sucesso!");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSellerId("");
    setClientId("");
    setClientSecret("");
    toast.success("Getnet desconectada");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <img src={getnetLogo} alt="Getnet" className="h-5 w-5 object-contain" />
              Getnet
              {isConnected ? (
                <Badge variant="default" className="gap-1">Conectado</Badge>
              ) : (
                <Badge variant="secondary">Desconectado</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Conecte sua maquininha Getnet (Santander) ao PDV
            </p>
          </div>
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Desconectar
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={connecting}>
              {connecting ? "Conectando..." : "Conectar"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="getnet-seller" className="text-sm">Seller ID (EC)</Label>
              <Input
                id="getnet-seller"
                placeholder="Ex: 6eb2412c-165a-41cd-b1d9-76c575d70a28"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="getnet-client-id" className="text-sm">Client ID</Label>
              <Input
                id="getnet-client-id"
                placeholder="Cole seu Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="getnet-client-secret" className="text-sm">Client Secret</Label>
              <Input
                id="getnet-client-secret"
                type="password"
                placeholder="Cole seu Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Ambiente</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Homologação)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha as credenciais em developers.getnet.com.br → Minha Conta → Credenciais
            </p>
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Ambiente: <span className="font-medium">{environment === "sandbox" ? "Sandbox" : "Produção"}</span>
                {" · "}Conexão: <span className="font-medium">
                  {connectionType === "cloud" ? "Cloud-to-Cloud" : connectionType === "usb" ? "USB/Serial" : "HTTP (Wi-Fi)"}
                </span>
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo de Conexão do POS</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">Cloud-to-Cloud</SelectItem>
                  <SelectItem value="usb">USB / Serial</SelectItem>
                  <SelectItem value="http">HTTP (Wi-Fi / Ethernet)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cloud: comunicação pela nuvem Getnet. USB: conexão física direta. HTTP: via rede local.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Captura automática</Label>
                <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Pix no terminal</Label>
                <Switch checked={terminalPix} onCheckedChange={setTerminalPix} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Imprimir comprovante</Label>
                <Switch checked={printReceipt} onCheckedChange={setPrintReceipt} />
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium">Taxas</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Débito: 1,49%</span>
                <span>Crédito à vista: 2,99%</span>
                <span>Parcelado 2-6x: 3,49%</span>
                <span>Parcelado 7-12x: 3,99%</span>
                <span>Pix: 0,89%</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• POS Integrado via Cloud, USB ou HTTP</p>
          <p>• Débito, crédito, parcelamento e Pix</p>
          <p>• Pré-autorização e cancelamento</p>
          <p>• Split de pagamento entre contas</p>
          <p>• Dashboard financeiro Getnet</p>
        </div>

        <a
          href="https://developers.getnet.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Portal do Desenvolvedor Getnet
        </a>
      </CardContent>
    </Card>
  );
}
