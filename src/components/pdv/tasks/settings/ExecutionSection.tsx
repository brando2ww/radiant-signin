import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ExecutionSettings {
  autoGenerate: boolean;
  allowLateCompletion: boolean;
  requirePhotoDefault: boolean;
  defaultMaxDurationMinutes: number;
  allowFreeNotes: boolean;
  showCountdownTimer: boolean;
}

interface Props {
  values: ExecutionSettings;
  onChange: (values: Partial<ExecutionSettings>) => void;
}

const TOGGLES: { key: keyof ExecutionSettings; label: string; desc: string }[] = [
  { key: "autoGenerate", label: "Geração automática de tarefas", desc: "Gerar tarefas diárias automaticamente à meia-noite" },
  { key: "allowLateCompletion", label: "Permitir conclusão após o prazo", desc: "Colaboradores podem concluir checklists após o horário limite" },
  { key: "requirePhotoDefault", label: "Exigir foto de conclusão por padrão", desc: "Pode ser sobrescrito por checklist individualmente" },
  { key: "allowFreeNotes", label: "Observações livres na conclusão", desc: "Colaboradores podem adicionar observações ao concluir" },
  { key: "showCountdownTimer", label: "Exibir cronômetro regressivo", desc: "Mostra contagem regressiva na tela de execução" },
];

export function ExecutionSection({ values, onChange }: Props) {
  return (
    <div className="space-y-5">
      {TOGGLES.map((t) => (
        <div key={t.key} className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label>{t.label}</Label>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </div>
          <Switch
            checked={values[t.key] as boolean}
            onCheckedChange={(v) => onChange({ [t.key]: v })}
          />
        </div>
      ))}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label>Tempo máximo padrão para conclusão</Label>
          <p className="text-xs text-muted-foreground">Usado quando o agendamento não define um prazo</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={5}
            className="w-20 h-8 text-sm"
            value={values.defaultMaxDurationMinutes}
            onChange={(e) => onChange({ defaultMaxDurationMinutes: +e.target.value })}
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      </div>
    </div>
  );
}
