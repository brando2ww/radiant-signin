import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function NFAutomaticaIntegrationCard() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [certificatePassword, setCertificatePassword] = useState("");
  const [serieNF, setSerieNF] = useState("1");
  const [regime, setRegime] = useState("simples");
  const [cfopPadrao, setCfopPadrao] = useState("5102");
  const [autoEmit, setAutoEmit] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState(true);

  const handleUploadCertificate = () => {
    // Simulação de upload
    setCertificateUploaded(true);
    toast.success("Certificado A1 carregado com sucesso!");
  };

  const handleSaveConfig = () => {
    if (!certificateUploaded) {
      toast.error("Carregue o certificado digital A1 primeiro");
      return;
    }
    if (!certificatePassword.trim()) {
      toast.error("Informe a senha do certificado");
      return;
    }
    setIsConfigured(true);
    toast.success("Configuração de NF salva com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              NF Automática
              {isConfigured ? (
                <Badge variant="default" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="secondary">Não configurado</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Emissão automática de notas fiscais ao finalizar vendas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Certificado Digital */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Certificado Digital A1</Label>
            {certificateUploaded ? (
              <div className="rounded-md bg-muted/50 p-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Certificado carregado</span>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setCertificateUploaded(false)}>
                  Trocar
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={handleUploadCertificate}>
                <Upload className="mr-2 h-4 w-4" />
                Carregar Certificado A1 (.pfx)
              </Button>
            )}
          </div>

          {certificateUploaded && (
            <div className="space-y-2">
              <Label htmlFor="cert-password" className="text-sm">Senha do Certificado</Label>
              <Input
                id="cert-password"
                type="password"
                placeholder="Senha do certificado digital"
                value={certificatePassword}
                onChange={(e) => setCertificatePassword(e.target.value)}
              />
            </div>
          )}

          {/* Dados Fiscais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Série da NF</Label>
              <Input
                value={serieNF}
                onChange={(e) => setSerieNF(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">CFOP Padrão</Label>
              <Input
                value={cfopPadrao}
                onChange={(e) => setCfopPadrao(e.target.value)}
                placeholder="5102"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Regime Tributário</Label>
            <Select value={regime} onValueChange={setRegime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples Nacional</SelectItem>
                <SelectItem value="presumido">Lucro Presumido</SelectItem>
                <SelectItem value="real">Lucro Real</SelectItem>
                <SelectItem value="mei">MEI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Emitir NF automaticamente ao fechar venda</Label>
              <Switch checked={autoEmit} onCheckedChange={setAutoEmit} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enviar NF por e-mail ao cliente</Label>
              <Switch checked={emailCustomer} onCheckedChange={setEmailCustomer} />
            </div>
          </div>

          {!isConfigured && (
            <Button className="w-full" onClick={handleSaveConfig}>
              Salvar Configuração
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• NFC-e e NF-e automáticas</p>
          <p>• Envio automático para SEFAZ</p>
          <p>• Cancelamento e carta de correção</p>
          <p>• XML e DANFE gerados automaticamente</p>
        </div>

        <a
          href="https://www.nfe.fazenda.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Portal NF-e SEFAZ
        </a>
      </CardContent>
    </Card>
  );
}
