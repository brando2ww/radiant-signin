import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Download, FileText } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";

const REPORT_CONTENT_OPTIONS = [
  { key: "taxa_conclusao", label: "Taxa de conclusão do dia" },
  { key: "atrasadas", label: "Tarefas atrasadas" },
  { key: "destaque", label: "Colaborador destaque" },
  { key: "criticos", label: "Itens críticos em aberto" },
  { key: "turnos", label: "Comparativo de turnos" },
];

const WEEK_DAYS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];

interface ReportSettings {
  whatsappReportEnabled: boolean;
  whatsappReportPhone: string;
  whatsappReportTime: string;
  reportDailyContent: string[];
  reportWeeklyEnabled: boolean;
  reportWeeklyDay: number;
}

interface Props {
  values: ReportSettings;
  onChange: (values: Partial<ReportSettings>) => void;
}

export function ReportsSection({ values, onChange }: Props) {
  const [exportRange, setExportRange] = useState<DateRange | undefined>();

  const toggleContent = (key: string) => {
    const current = values.reportDailyContent || [];
    const updated = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    onChange({ reportDailyContent: updated });
  };

  return (
    <div className="space-y-5">
      {/* Daily WhatsApp report */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label>Relatório diário via WhatsApp</Label>
            <p className="text-xs text-muted-foreground">Resumo automático das tarefas do dia</p>
          </div>
          <Switch checked={values.whatsappReportEnabled} onCheckedChange={(v) => onChange({ whatsappReportEnabled: v })} />
        </div>

        {values.whatsappReportEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-muted">
            <div>
              <Label className="text-xs">Número destino</Label>
              <PhoneInput
                value={values.whatsappReportPhone}
                onChange={(v) => onChange({ whatsappReportPhone: v })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="w-32">
              <Label className="text-xs">Horário de envio</Label>
              <Input type="time" className="h-8" value={values.whatsappReportTime} onChange={(e) => onChange({ whatsappReportTime: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      {/* Report content */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Conteúdo do relatório</Label>
        <p className="text-xs text-muted-foreground">Escolha o que incluir nos relatórios automáticos</p>
        <div className="space-y-2 mt-2">
          {REPORT_CONTENT_OPTIONS.map((opt) => (
            <div key={opt.key} className="flex items-center gap-2">
              <Checkbox
                checked={(values.reportDailyContent || []).includes(opt.key)}
                onCheckedChange={() => toggleContent(opt.key)}
              />
              <Label className="text-sm font-normal cursor-pointer">{opt.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly report */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label>Relatório semanal</Label>
            <p className="text-xs text-muted-foreground">Resumo consolidado enviado uma vez por semana</p>
          </div>
          <Switch checked={values.reportWeeklyEnabled} onCheckedChange={(v) => onChange({ reportWeeklyEnabled: v })} />
        </div>
        {values.reportWeeklyEnabled && (
          <div className="w-48 pl-4 border-l-2 border-muted">
            <Label className="text-xs">Dia do envio</Label>
            <Select value={String(values.reportWeeklyDay)} onValueChange={(v) => onChange({ reportWeeklyDay: +v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WEEK_DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Manual export */}
      <div className="space-y-3 pt-3 border-t border-border">
        <Label className="text-sm font-semibold">Exportação manual</Label>
        <p className="text-xs text-muted-foreground">Gere um relatório do período selecionado</p>
        <DatePickerWithRange date={exportRange} setDate={setExportRange} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!exportRange?.from || !exportRange?.to}>
            <Download className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" disabled={!exportRange?.from || !exportRange?.to}>
            <FileText className="h-4 w-4 mr-1" /> Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
