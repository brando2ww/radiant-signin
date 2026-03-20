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

export function PagSeguroIntegrationCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState("");
  const [connectionType, setConnectionType] = useState("bluetooth");
  const [autoCapture, setAutoCapture] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!token.trim()) {
      toast.error("Informe o token de autenticação");
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
      toast.success("PagSeguro conectado com sucesso!");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setToken("");
    toast.success("PagSeguro desconectado");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              PagSeguro
              {isConnected ? (
                <Badge variant="default" className="gap-1">Conectado</Badge>
              ) : (
                <Badge variant="secondary">Desconectado</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Integre sua maquininha PagSeguro para aceitar cartões
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
              <Label htmlFor="pagseguro-token" className="text-sm">Token de Autenticação</Label>
              <Input
                id="pagseguro-token"
                type="password"
                placeholder="Cole seu token PagSeguro aqui"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Encontre em: PagSeguro → Minha Conta → Integrações → Token
              </p>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">Terminal conectado via {connectionType === "bluetooth" ? "Bluetooth" : "USB"}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo de Conexão</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bluetooth">Bluetooth</SelectItem>
                  <SelectItem value="usb">USB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Captura automática</Label>
                <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Imprimir comprovante na maquininha</Label>
                <Switch checked={printReceipt} onCheckedChange={setPrintReceipt} />
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium">Taxas por Bandeira</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Visa/Master Débito: 1,99%</span>
                <span>Visa/Master Crédito: 3,19%</span>
                <span>Elo Débito: 1,99%</span>
                <span>Elo Crédito: 3,49%</span>
                <span>Parcelado 2-6x: 3,79%</span>
                <span>Parcelado 7-12x: 4,29%</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• Aceite cartões de débito e crédito</p>
          <p>• Parcelamento em até 12x</p>
          <p>• Comprovante digital ou impresso</p>
          <p>• Antecipação de recebíveis</p>
        </div>

        <a
          href="https://dev.pagseguro.uol.com.br/reference"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Documentação PagSeguro
        </a>
      </CardContent>
    </Card>
  );
}
