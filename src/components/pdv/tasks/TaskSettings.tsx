import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, MessageSquare } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { useOperationalTasks, type ShiftConfig } from "@/hooks/use-operational-tasks";

export function TaskSettings() {
  const { settings, saveSettings } = useOperationalTasks();
  const [shifts, setShifts] = useState<ShiftConfig[]>(settings.shifts);
  const [autoGenerate, setAutoGenerate] = useState(settings.autoGenerate);
  const [qrEnabled, setQrEnabled] = useState(settings.qrCodeEnabled);
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsappReportEnabled);
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappReportPhone);
  const [whatsappTime, setWhatsappTime] = useState(settings.whatsappReportTime);

  useEffect(() => {
    setShifts(settings.shifts);
    setAutoGenerate(settings.autoGenerate);
    setQrEnabled(settings.qrCodeEnabled);
    setWhatsappEnabled(settings.whatsappReportEnabled);
    setWhatsappPhone(settings.whatsappReportPhone);
    setWhatsappTime(settings.whatsappReportTime);
  }, [settings]);

  const addShift = () => {
    setShifts([...shifts, { name: "", start: "00:00", end: "00:00" }]);
  };

  const removeShift = (idx: number) => {
    setShifts(shifts.filter((_, i) => i !== idx));
  };

  const updateShift = (idx: number, field: keyof ShiftConfig, value: string) => {
    const updated = [...shifts];
    updated[idx] = { ...updated[idx], [field]: value };
    setShifts(updated);
  };

  const handleSave = () => {
    saveSettings({
      shifts,
      autoGenerate,
      qrCodeEnabled: qrEnabled,
      whatsappReportEnabled: whatsappEnabled,
      whatsappReportPhone: whatsappPhone,
      whatsappReportTime: whatsappTime,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Turnos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shifts.map((s, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Nome</Label>
                <Input value={s.name} onChange={(e) => updateShift(i, "name", e.target.value)} placeholder="Ex: Abertura" />
              </div>
              <div className="w-28">
                <Label className="text-xs">Início</Label>
                <Input type="time" value={s.start} onChange={(e) => updateShift(i, "start", e.target.value)} />
              </div>
              <div className="w-28">
                <Label className="text-xs">Fim</Label>
                <Input type="time" value={s.end} onChange={(e) => updateShift(i, "end", e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeShift(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addShift}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Turno
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Geração automática de tarefas</Label>
              <p className="text-xs text-muted-foreground">Gerar tarefas diárias automaticamente à meia-noite</p>
            </div>
            <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>QR Code público</Label>
              <p className="text-xs text-muted-foreground">Permitir acesso público via QR Code</p>
            </div>
            <Switch checked={qrEnabled} onCheckedChange={setQrEnabled} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Relatório WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enviar relatório diário via WhatsApp</Label>
              <p className="text-xs text-muted-foreground">Resumo automático das tarefas do dia no horário configurado</p>
            </div>
            <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
          </div>

          {whatsappEnabled && (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label className="text-xs">Número destino</Label>
                <PhoneInput
                  value={whatsappPhone}
                  onChange={setWhatsappPhone}
                  placeholder="(00) 00000-0000"
                />
                <p className="text-xs text-muted-foreground mt-1">Número que receberá o relatório diário</p>
              </div>
              <div className="w-40">
                <Label className="text-xs">Horário de envio</Label>
                <Input
                  type="time"
                  value={whatsappTime}
                  onChange={(e) => setWhatsappTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Horário do disparo automático</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" /> Salvar Configurações
      </Button>
    </div>
  );
}
