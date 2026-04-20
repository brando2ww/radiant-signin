import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed, Armchair, Calculator, Wine, Package, Briefcase,
  Sun, Sunset, Moon, Clock,
} from "lucide-react";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { SECTOR_COLORS } from "@/data/sector-colors";
import { cn } from "@/lib/utils";
import type { ChecklistConfig } from "@/pages/pdv/ChecklistEditor";
import { QrCode } from "lucide-react";

const SECTOR_ICONS: Record<ChecklistSector, React.ElementType> = {
  cozinha: UtensilsCrossed,
  salao: Armchair,
  caixa: Calculator,
  bar: Wine,
  estoque: Package,
  gerencia: Briefcase,
};

const SHIFT_OPTIONS = [
  { value: "manha", label: "Manhã", icon: Sun },
  { value: "tarde", label: "Tarde", icon: Sunset },
  { value: "noite", label: "Noite", icon: Moon },
  { value: "todos", label: "Todos", icon: Clock },
];

interface Props {
  config: ChecklistConfig;
  onChange: (config: ChecklistConfig) => void;
}

export function ChecklistConfigPanel({ config, onChange }: Props) {
  const update = (patch: Partial<ChecklistConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Nome do Checklist *</Label>
        <Input
          placeholder="Ex: Abertura Cozinha"
          value={config.name}
          onChange={(e) => update({ name: e.target.value })}
          className="text-base"
        />
      </div>

      {/* Setor - Visual Grid */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Setor</Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => {
            const Icon = SECTOR_ICONS[s];
            const isActive = config.sector === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => update({ sector: s })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all",
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {SECTOR_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Descrição (opcional)</Label>
        <Textarea
          placeholder="Breve descrição do checklist..."
          value={config.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Cor */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Cor identificadora</Label>
        <div className="flex flex-wrap gap-2">
          {SECTOR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => update({ color: c.value })}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                config.color === c.value
                  ? "border-foreground scale-110 shadow-md"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Turno Padrão */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Turno padrão</Label>
        <div className="grid grid-cols-2 gap-2">
          {SHIFT_OPTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = config.default_shift === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => update({ default_shift: s.value })}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <p className="text-xs text-muted-foreground">
            {config.is_active ? "Ativo — visível para colaboradores" : "Rascunho — não será exibido"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.is_active ? "default" : "secondary"}>
            {config.is_active ? "Ativo" : "Rascunho"}
          </Badge>
          <Switch
            checked={config.is_active}
            onCheckedChange={(v) => update({ is_active: v })}
          />
        </div>
      </div>

      {/* QR Access */}
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-start gap-2">
          <QrCode className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <Label className="text-sm font-medium">Acesso via QR Code</Label>
            <p className="text-xs text-muted-foreground">
              Permite escanear o QR para abrir o checklist sem login
            </p>
          </div>
        </div>
        <Switch
          checked={config.qr_access_enabled}
          onCheckedChange={(v) => update({ qr_access_enabled: v })}
        />
      </div>
    </div>
  );
}
