import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Smartphone, Wifi } from "lucide-react";
import { toast } from "sonner";

export function StoneIntegrationCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [stoneCode, setStoneCode] = useState("");
  const [captureType, setCaptureType] = useState("auto");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!stoneCode.trim()) {
      toast.error("Informe o Stone Code");
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
      toast.success("Stone conectado com sucesso!");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setStoneCode("");
    toast.success("Stone desconectado");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-green-700" />
              Stone
              {isConnected ? (
                <Badge variant="default" className="gap-1">Conectado</Badge>
              ) : (
                <Badge variant="secondary">Desconectado</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Conecte sua maquininha Stone ao PDV
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
              <Label htmlFor="stone-code" className="text-sm">Stone Code</Label>
              <Input
                id="stone-code"
                placeholder="Ex: 123456789"
                value={stoneCode}
                onChange={(e) => setStoneCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Encontre o Stone Code no adesivo da sua maquininha ou no portal Stone
              </p>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-700" />
              <span className="text-sm">Terminal Stone Code: <span className="font-mono">{stoneCode}</span></span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo de Captura</Label>
              <Select value={captureType} onValueChange={setCaptureType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automática</SelectItem>
                  <SelectItem value="manual">Manual (pré-autorização)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Split de pagamento</Label>
                <Switch checked={splitEnabled} onCheckedChange={setSplitEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Imprimir comprovante</Label>
                <Switch checked={printReceipt} onCheckedChange={setPrintReceipt} />
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium">Taxas</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Débito: 1,67%</span>
                <span>Crédito à vista: 2,98%</span>
                <span>Parcelado 2-6x: 3,48%</span>
                <span>Parcelado 7-12x: 3,98%</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• Integração direta com terminal Stone</p>
          <p>• Split de pagamento entre estabelecimentos</p>
          <p>• Antecipação de recebíveis</p>
          <p>• Dashboard de gestão financeira</p>
        </div>

        <a
          href="https://docs.stone.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Documentação Stone
        </a>
      </CardContent>
    </Card>
  );
}
