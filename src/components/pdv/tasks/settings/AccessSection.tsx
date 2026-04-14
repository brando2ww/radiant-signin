import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

interface AccessSettings {
  qrCodeEnabled: boolean;
  blockEarlyExecution: boolean;
  minPinDigits: number;
  sessionTimeoutMinutes: number;
}

interface Props {
  values: AccessSettings;
  onChange: (values: Partial<AccessSettings>) => void;
  onNavigateToLogs?: () => void;
}

export function AccessSection({ values, onChange, onNavigateToLogs }: Props) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/checklist-publico`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* QR Code */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label>QR Code público</Label>
            <p className="text-xs text-muted-foreground">Permitir acesso público via QR Code</p>
          </div>
          <Switch checked={values.qrCodeEnabled} onCheckedChange={(v) => onChange({ qrCodeEnabled: v })} />
        </div>
        {values.qrCodeEnabled && (
          <div className="flex items-center gap-2 pl-4 border-l-2 border-muted">
            <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground truncate max-w-[250px]">{publicUrl}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "Copiado!" : "Copiar link"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block early execution */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label>Bloquear execução fora do horário</Label>
          <p className="text-xs text-muted-foreground">Colaborador não pode iniciar checklist antes do horário agendado</p>
        </div>
        <Switch checked={values.blockEarlyExecution} onCheckedChange={(v) => onChange({ blockEarlyExecution: v })} />
      </div>

      {/* PIN digits */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label>Número mínimo de dígitos do PIN</Label>
          <p className="text-xs text-muted-foreground">Padrão: 4 dígitos</p>
        </div>
        <Input
          type="number"
          min={3}
          max={8}
          className="w-20 h-8 text-sm"
          value={values.minPinDigits}
          onChange={(e) => onChange({ minPinDigits: +e.target.value })}
        />
      </div>

      {/* Session timeout */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label>Tempo de sessão do colaborador</Label>
          <p className="text-xs text-muted-foreground">Minutos antes de pedir PIN novamente</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1}
            className="w-20 h-8 text-sm"
            value={values.sessionTimeoutMinutes}
            onChange={(e) => onChange({ sessionTimeoutMinutes: +e.target.value })}
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      </div>

      {/* Logs link */}
      {onNavigateToLogs && (
        <div className="pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onNavigateToLogs}>
            <ExternalLink className="h-4 w-4 mr-1" /> Ver Log de Acessos
          </Button>
        </div>
      )}
    </div>
  );
}
