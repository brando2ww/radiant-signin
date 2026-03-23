import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Wifi } from "lucide-react";
import { toast } from "sonner";

import redeLogo from "@/assets/integrations/rede.png";

export function RedeIntegrationCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [pv, setPv] = useState("");
  const [token, setToken] = useState("");
  const [environment, setEnvironment] = useState("sandbox");
  const [connectionType, setConnectionType] = useState("usb");
  const [autoCapture, setAutoCapture] = useState(true);
  const [terminalPix, setTerminalPix] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!pv.trim() || !token.trim()) {
      toast.error("Preencha todas as credenciais");
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
      toast.success("Rede conectada com sucesso!");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setPv("");
    setToken("");
    toast.success("Rede desconectada");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <img src={redeLogo} alt="Rede" className="h-5 w-5 object-contain" />
              Rede
              {isConnected ? (
                <Badge variant="default" className="gap-1">Conectado</Badge>
              ) : (
                <Badge variant="secondary">Desconectado</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Conecte sua maquininha Rede (Itaú) ao PDV
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
              <Label htmlFor="rede-pv" className="text-sm">PV (Ponto de Venda / Filiação)</Label>
              <Input
                id="rede-pv"
                placeholder="Ex: 12345678"
                value={pv}
                onChange={(e) => setPv(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rede-token" className="text-sm">Token de Autenticação</Label>
              <Input
                id="rede-token"
                type="password"
                placeholder="Cole seu token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
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
              Obtenha as credenciais em userede.com.br → Portal e-Rede → Credenciais
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
                  {connectionType === "usb" ? "USB" : connectionType === "bluetooth" ? "Bluetooth" : "HTTP (Wi-Fi)"}
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
                  <SelectItem value="usb">USB</SelectItem>
                  <SelectItem value="bluetooth">Bluetooth</SelectItem>
                  <SelectItem value="http">HTTP (Wi-Fi / Ethernet)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                USB: conexão física direta. Bluetooth: sem fio de curta distância. HTTP: via rede local.
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
                <span>Débito: 1,39%</span>
                <span>Crédito à vista: 2,79%</span>
                <span>Parcelado 2-6x: 3,29%</span>
                <span>Parcelado 7-12x: 3,79%</span>
                <span>Pix: 0,79%</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• Terminal integrado via USB, Bluetooth ou HTTP</p>
          <p>• Débito, crédito e parcelamento de todas as bandeiras</p>
          <p>• Pix no terminal via e-Rede</p>
          <p>• Captura automática de transações</p>
          <p>• Comprovante digital (SMS/e-mail)</p>
          <p>• Dashboard financeiro e-Rede</p>
        </div>

        <a
          href="https://www.userede.com.br/desenvolvedores"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Portal do Desenvolvedor Rede
        </a>
      </CardContent>
    </Card>
  );
}
