import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExternalLink, QrCode, TabletSmartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function GoomerIntegrationCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [syncMenu, setSyncMenu] = useState(true);
  const [qrCodePerTable, setQrCodePerTable] = useState(true);
  const [tabletOrders, setTabletOrders] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!apiToken.trim()) {
      toast.error("Informe o token da API Goomer");
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
      toast.success("Goomer conectado com sucesso!");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiToken("");
    toast.success("Goomer desconectado");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TabletSmartphone className="h-5 w-5 text-orange-600" />
              Goomer
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
              Cardápio digital e pedidos via QR Code nas mesas
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
              <Label htmlFor="goomer-token" className="text-sm">Token da API</Label>
              <Input
                id="goomer-token"
                type="password"
                placeholder="Cole seu token Goomer aqui"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Acesse: Goomer → Configurações → Integrações → API Token
              </p>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Sincronizar cardápio com Goomer</Label>
                <Switch checked={syncMenu} onCheckedChange={setSyncMenu} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">QR Code por mesa</Label>
                  <p className="text-xs text-muted-foreground">Gera QR Codes únicos para cada mesa</p>
                </div>
                <Switch checked={qrCodePerTable} onCheckedChange={setQrCodePerTable} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Pedidos via tablet</Label>
                  <p className="text-xs text-muted-foreground">Receber pedidos feitos nos tablets das mesas</p>
                </div>
                <Switch checked={tabletOrders} onCheckedChange={setTabletOrders} />
              </div>
            </div>

            {qrCodePerTable && (
              <Button variant="outline" className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Gerar QR Codes das Mesas
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• Cardápio digital interativo</p>
          <p>• QR Code individual por mesa</p>
          <p>• Pedidos via tablet integrados ao PDV</p>
          <p>• Atualização automática de cardápio</p>
        </div>

        <a
          href="https://www.goomer.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Site Goomer
        </a>
      </CardContent>
    </Card>
  );
}
