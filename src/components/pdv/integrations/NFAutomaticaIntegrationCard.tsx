import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, ShieldCheck, ExternalLink, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { usePDVSettings } from "@/hooks/use-pdv-settings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnderecoFiscal {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  codigo_municipio: string;
}

export function NFAutomaticaIntegrationCard() {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings, isUpdating } = usePDVSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Local state for form fields
  const [certPassword, setCertPassword] = useState("");
  const [serieNF, setSerieNF] = useState("1");
  const [serieNFCe, setSerieNFCe] = useState("1");
  const [numeroInicial, setNumeroInicial] = useState("1");
  const [cfopPadrao, setCfopPadrao] = useState("5102");
  const [regime, setRegime] = useState("simples");
  const [ambiente, setAmbiente] = useState("homologacao");
  const [cstCsosn, setCstCsosn] = useState("102");
  const [aliqIcms, setAliqIcms] = useState("0");
  const [aliqPis, setAliqPis] = useState("0");
  const [aliqCofins, setAliqCofins] = useState("0");
  const [autoEmit, setAutoEmit] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState(true);
  const [enableNfce, setEnableNfce] = useState(false);
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [cscId, setCscId] = useState("");
  const [cscToken, setCscToken] = useState("");
  const [endereco, setEndereco] = useState<EnderecoFiscal>({
    logradouro: "", numero: "", complemento: "", bairro: "",
    cidade: "", uf: "", cep: "", codigo_municipio: "",
  });

  // Sync from DB on load
  useEffect(() => {
    if (!settings) return;
    setCertPassword(settings.nfe_certificate_password || "");
    setSerieNF(settings.nfe_serie || "1");
    setSerieNFCe(settings.nfe_serie_nfce || "1");
    setNumeroInicial(String(settings.nfe_numero_inicial || 1));
    setCfopPadrao(settings.nfe_cfop_padrao || "5102");
    setRegime(settings.tax_regime || "simples");
    setAmbiente(settings.nfe_ambiente || "homologacao");
    setCstCsosn(settings.nfe_cst_csosn || "102");
    setAliqIcms(String(settings.nfe_aliquota_icms || 0));
    setAliqPis(String(settings.nfe_aliquota_pis || 0));
    setAliqCofins(String(settings.nfe_aliquota_cofins || 0));
    setAutoEmit(settings.nfe_auto_emit || false);
    setEmailCustomer(settings.nfe_email_customer ?? true);
    setEnableNfce(settings.nfe_enable_nfce || false);
    setNomeFantasia(settings.nfe_nome_fantasia || "");
    setInscricaoMunicipal(settings.nfe_inscricao_municipal || "");
    setCscId(settings.nfe_csc_id || "");
    setCscToken(settings.nfe_csc_token || "");
    const addr = settings.nfe_endereco_fiscal as EnderecoFiscal | undefined;
    if (addr) setEndereco(addr);
  }, [settings]);

  const isConfigured = !!settings?.nfe_certificate_url;

  const handleUploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.name.endsWith(".pfx") && !file.name.endsWith(".p12")) {
      toast.error("Selecione um arquivo .pfx ou .p12");
      return;
    }
    setUploading(true);
    try {
      const filePath = `${user.id}/certificate.pfx`;
      await supabase.storage.from("certificates").remove([filePath]);
      const { error } = await supabase.storage.from("certificates").upload(filePath, file, { upsert: true });
      if (error) throw error;
      updateSettings({ nfe_certificate_url: filePath });
      toast.success("Certificado A1 carregado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao fazer upload do certificado: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCertificate = async () => {
    if (!user || !settings?.nfe_certificate_url) return;
    await supabase.storage.from("certificates").remove([settings.nfe_certificate_url]);
    updateSettings({ nfe_certificate_url: null as any });
    toast.success("Certificado removido");
  };

  const handleSave = () => {
    updateSettings({
      nfe_certificate_password: certPassword,
      nfe_serie: serieNF,
      nfe_serie_nfce: serieNFCe,
      nfe_numero_inicial: parseInt(numeroInicial) || 1,
      nfe_cfop_padrao: cfopPadrao,
      tax_regime: regime,
      nfe_ambiente: ambiente,
      nfe_cst_csosn: cstCsosn,
      nfe_aliquota_icms: parseFloat(aliqIcms) || 0,
      nfe_aliquota_pis: parseFloat(aliqPis) || 0,
      nfe_aliquota_cofins: parseFloat(aliqCofins) || 0,
      nfe_auto_emit: autoEmit,
      nfe_email_customer: emailCustomer,
      nfe_enable_nfce: enableNfce,
      nfe_nome_fantasia: nomeFantasia,
      nfe_inscricao_municipal: inscricaoMunicipal,
      nfe_endereco_fiscal: endereco as any,
      nfe_csc_id: cscId,
      nfe_csc_token: cscToken,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
      <CardContent className="space-y-6">
        {/* CERTIFICADO DIGITAL */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Certificado Digital</h4>
          <input type="file" ref={fileInputRef} accept=".pfx,.p12" className="hidden" onChange={handleUploadCertificate} />
          {settings?.nfe_certificate_url ? (
            <div className="rounded-md bg-muted/50 p-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm">Certificado A1 carregado</span>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={handleRemoveCertificate}>Trocar</Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? "Enviando..." : "Carregar Certificado A1 (.pfx)"}
            </Button>
          )}
          <div className="space-y-2">
            <Label htmlFor="cert-password" className="text-sm">Senha do Certificado</Label>
            <Input id="cert-password" type="password" placeholder="Senha do certificado digital" value={certPassword} onChange={(e) => setCertPassword(e.target.value)} />
          </div>
        </div>

        <Separator />

        {/* DADOS DA EMPRESA */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dados da Empresa</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Razão Social</Label>
              <Input value={settings?.business_name || ""} disabled placeholder="Configurado em Dados Gerais" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Nome Fantasia</Label>
              <Input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Nome comercial" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">CNPJ</Label>
              <Input value={settings?.business_cnpj || ""} disabled placeholder="Configurado em Dados Gerais" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Inscrição Estadual</Label>
              <Input value={settings?.state_registration || ""} disabled placeholder="Configurado em Dados Gerais" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Inscrição Municipal</Label>
              <Input value={inscricaoMunicipal} onChange={(e) => setInscricaoMunicipal(e.target.value)} placeholder="IM para NFS-e" />
            </div>
          </div>
        </div>

        <Separator />

        {/* ENDEREÇO FISCAL */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Endereço Fiscal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm">Logradouro</Label>
              <Input value={endereco.logradouro} onChange={(e) => setEndereco(p => ({ ...p, logradouro: e.target.value }))} placeholder="Rua, Avenida..." />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Número</Label>
              <Input value={endereco.numero} onChange={(e) => setEndereco(p => ({ ...p, numero: e.target.value }))} placeholder="Nº" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Complemento</Label>
              <Input value={endereco.complemento} onChange={(e) => setEndereco(p => ({ ...p, complemento: e.target.value }))} placeholder="Sala, Andar..." />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Bairro</Label>
              <Input value={endereco.bairro} onChange={(e) => setEndereco(p => ({ ...p, bairro: e.target.value }))} placeholder="Bairro" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Cidade</Label>
              <Input value={endereco.cidade} onChange={(e) => setEndereco(p => ({ ...p, cidade: e.target.value }))} placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">UF</Label>
              <Input value={endereco.uf} onChange={(e) => setEndereco(p => ({ ...p, uf: e.target.value }))} placeholder="SP" maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">CEP</Label>
              <Input value={endereco.cep} onChange={(e) => setEndereco(p => ({ ...p, cep: e.target.value }))} placeholder="00000-000" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Cód. Município (IBGE)</Label>
              <Input value={endereco.codigo_municipio} onChange={(e) => setEndereco(p => ({ ...p, codigo_municipio: e.target.value }))} placeholder="3550308" />
            </div>
          </div>
        </div>

        <Separator />

        {/* CONFIGURAÇÃO FISCAL */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Configuração Fiscal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Regime Tributário</Label>
              <Select value={regime} onValueChange={setRegime}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples Nacional</SelectItem>
                  <SelectItem value="presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="real">Lucro Real</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Ambiente</Label>
              <Select value={ambiente} onValueChange={setAmbiente}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação (testes)</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Série NF-e</Label>
              <Input value={serieNF} onChange={(e) => setSerieNF(e.target.value)} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Série NFC-e</Label>
              <Input value={serieNFCe} onChange={(e) => setSerieNFCe(e.target.value)} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Nº Inicial NF-e</Label>
              <Input type="number" value={numeroInicial} onChange={(e) => setNumeroInicial(e.target.value)} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">CFOP Padrão</Label>
              <Input value={cfopPadrao} onChange={(e) => setCfopPadrao(e.target.value)} placeholder="5102" />
            </div>
          </div>
        </div>

        <Separator />

        {/* TRIBUTAÇÃO PADRÃO */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tributação Padrão</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">CST/CSOSN</Label>
              <Input value={cstCsosn} onChange={(e) => setCstCsosn(e.target.value)} placeholder="102" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Alíquota ICMS (%)</Label>
              <Input type="number" step="0.01" value={aliqIcms} onChange={(e) => setAliqIcms(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Alíquota PIS (%)</Label>
              <Input type="number" step="0.01" value={aliqPis} onChange={(e) => setAliqPis(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Alíquota COFINS (%)</Label>
              <Input type="number" step="0.01" value={aliqCofins} onChange={(e) => setAliqCofins(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </div>

        <Separator />

        {/* CSC NFC-e */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">CSC NFC-e</h4>
          <p className="text-xs text-muted-foreground">
            Código de Segurança do Contribuinte. Gere no portal SEFAZ do seu estado. Obrigatório para emitir NFC-e.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">ID do CSC (idToken)</Label>
              <Input value={cscId} onChange={(e) => setCscId(e.target.value)} placeholder="Ex: 000001" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Token CSC</Label>
              <Input type="password" value={cscToken} onChange={(e) => setCscToken(e.target.value)} placeholder="Token gerado pela SEFAZ" />
            </div>
          </div>
        </div>

        <Separator />

        {/* AUTOMAÇÃO */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Automação</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Emitir NF ao fechar venda</Label>
              <Switch checked={autoEmit} onCheckedChange={setAutoEmit} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enviar NF por e-mail ao cliente</Label>
              <Switch checked={emailCustomer} onCheckedChange={setEmailCustomer} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Habilitar NFC-e (cupom fiscal)</Label>
              <Switch checked={enableNfce} onCheckedChange={setEnableNfce} />
            </div>
          </div>
        </div>

        <Separator />

        {/* CHECKLIST */}
        <div className="space-y-2 rounded-md border p-3 bg-muted/30">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Checklist para emitir NFC-e
          </h4>
          {[
            { ok: !!settings?.nfe_certificate_url, label: "Certificado A1 (.pfx) carregado" },
            { ok: !!settings?.business_cnpj, label: "CNPJ do estabelecimento" },
            { ok: !!cscId && !!cscToken, label: "CSC (ID + Token) preenchidos" },
            { ok: !!endereco.uf && !!endereco.codigo_municipio, label: "Endereço fiscal completo (UF + IBGE)" },
            { ok: enableNfce, label: "NFC-e habilitada acima" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {item.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
              <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-1">
            Lembrete: a empresa também precisa estar habilitada para emitir NFC-e na SEFAZ do seu estado, e cada produto vendido precisa ter NCM válido (8 dígitos).
          </p>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar Configuração
        </Button>

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• NFC-e e NF-e automáticas</p>
          <p>• Envio automático para SEFAZ</p>
          <p>• Cancelamento e carta de correção</p>
          <p>• XML e DANFE gerados automaticamente</p>
        </div>

        <a href="https://www.nfe.fazenda.gov.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="h-3 w-3" />
          Portal NF-e SEFAZ
        </a>
      </CardContent>
    </Card>
  );
}
