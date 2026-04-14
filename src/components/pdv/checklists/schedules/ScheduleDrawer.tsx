import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, Sun, Sunset, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useChecklistSchedules } from "@/hooks/use-checklist-schedules";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import type { Database } from "@/integrations/supabase/types";

type ChecklistRow = Database["public"]["Tables"]["checklists"]["Row"];
type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  schedules: any[];
  checklists: ChecklistRow[];
  operators: OperatorRow[];
  presetDay?: number | null;
  presetShift?: string | null;
}

export function ScheduleDrawer({ open, onOpenChange, editingId, schedules, checklists, operators, presetDay, presetShift }: Props) {
  const { createSchedule, updateSchedule } = useChecklistSchedules();
  const editing = editingId ? schedules.find((s: any) => s.id === editingId) : null;

  const [checklistId, setChecklistId] = useState("");
  const [shift, setShift] = useState("manha");
  const [startTime, setStartTime] = useState("08:00");
  const [maxDuration, setMaxDuration] = useState(60);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [assignType, setAssignType] = useState<"operator" | "sector" | "any">("any");
  const [operatorId, setOperatorId] = useState("");
  const [assignedSector, setAssignedSector] = useState<ChecklistSector>("cozinha");
  const [recurrenceType, setRecurrenceType] = useState("weekly");
  const [recurrenceDate, setRecurrenceDate] = useState<Date | undefined>();
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState("1");
  const [notifyOnOverdue, setNotifyOnOverdue] = useState(true);
  const [allowLateCompletion, setAllowLateCompletion] = useState(true);
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [notes, setNotes] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (editing) {
      setChecklistId(editing.checklist_id);
      setShift(editing.shift);
      setStartTime((editing.start_time || "08:00").slice(0, 5));
      setMaxDuration(editing.max_duration_minutes || 60);
      setDaysOfWeek((editing.days_of_week as number[]) || [1, 2, 3, 4, 5]);
      setRecurrenceType(editing.recurrence_type || "weekly");
      setRecurrenceDate(editing.recurrence_date ? new Date(editing.recurrence_date) : undefined);
      setRecurrenceDayOfMonth(String(editing.recurrence_day_of_month || 1));
      setNotifyOnOverdue(editing.notify_on_overdue ?? true);
      setAllowLateCompletion(editing.allow_late_completion ?? true);
      setRequirePhoto(editing.require_photo ?? false);
      setNotes(editing.notes || "");
      if (editing.assigned_operator_id) {
        setAssignType("operator");
        setOperatorId(editing.assigned_operator_id);
      } else if (editing.assigned_sector) {
        setAssignType("sector");
        setAssignedSector(editing.assigned_sector);
      } else {
        setAssignType("any");
      }
    } else {
      setChecklistId(checklists[0]?.id || "");
      setShift(presetShift || "manha");
      setStartTime("08:00");
      setMaxDuration(60);
      setDaysOfWeek(presetDay != null ? [presetDay] : [1, 2, 3, 4, 5]);
      setRecurrenceType("weekly");
      setRecurrenceDate(undefined);
      setRecurrenceDayOfMonth("1");
      setAssignType("any");
      setOperatorId("");
      setAssignedSector("cozinha");
      setNotifyOnOverdue(true);
      setAllowLateCompletion(true);
      setRequirePhoto(false);
      setNotes("");
      setAdvancedOpen(false);
    }
  }, [editing, open, checklists, presetDay, presetShift]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const formatDuration = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0) return `${min}min`;
    if (min === 0) return `${h}h`;
    return `${h}h ${min}min`;
  };

  const handleSave = async () => {
    const data: any = {
      checklist_id: checklistId,
      shift,
      start_time: startTime,
      max_duration_minutes: maxDuration,
      days_of_week: daysOfWeek,
      assigned_operator_id: assignType === "operator" && operatorId ? operatorId : null,
      assigned_sector: assignType === "sector" ? assignedSector : null,
      recurrence_type: recurrenceType,
      recurrence_date: recurrenceType === "once" && recurrenceDate ? format(recurrenceDate, "yyyy-MM-dd") : null,
      recurrence_day_of_month: recurrenceType === "monthly" ? Number(recurrenceDayOfMonth) : null,
      notify_on_overdue: notifyOnOverdue,
      allow_late_completion: allowLateCompletion,
      require_photo: requirePhoto,
      notes: notes || null,
    };

    if (editing) {
      updateSchedule({ id: editing.id, ...data });
    } else {
      await createSchedule(data);
    }
    onOpenChange(false);
  };

  const selectedChecklist = checklists.find((c) => c.id === checklistId);

  const shifts = [
    { value: "manha", label: "Manhã", icon: Sun },
    { value: "tarde", label: "Tarde", icon: Sunset },
    { value: "noite", label: "Noite", icon: Moon },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle>{editing ? "Editar Agendamento" : "Novo Agendamento"}</SheetTitle>
          <SheetDescription>Configure os detalhes do agendamento</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Checklist */}
          <div className="space-y-1.5">
            <Label>Checklist</Label>
            <Select value={checklistId} onValueChange={setChecklistId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um checklist..." />
              </SelectTrigger>
              <SelectContent>
                {checklists.map((cl) => (
                  <SelectItem key={cl.id} value={cl.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cl.color || "#6366f1" }} />
                      {cl.name}
                      <span className="text-muted-foreground text-xs">({SECTOR_LABELS[cl.sector]})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChecklist && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: selectedChecklist.color || "#6366f1" }} />
                {SECTOR_LABELS[selectedChecklist.sector]}
              </div>
            )}
          </div>

          {/* Turno */}
          <div className="space-y-1.5">
            <Label>Turno</Label>
            <div className="grid grid-cols-3 gap-2">
              {shifts.map((s) => (
                <Button
                  key={s.value}
                  type="button"
                  variant={shift === s.value ? "default" : "outline"}
                  className="h-10 gap-2"
                  onClick={() => setShift(s.value)}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Horário */}
          <div className="space-y-1.5">
            <Label>Horário de início</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>

          {/* Prazo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Prazo máximo</Label>
              <span className="text-xs font-medium text-primary">{formatDuration(maxDuration)}</span>
            </div>
            <Slider
              value={[maxDuration]}
              onValueChange={([v]) => setMaxDuration(v)}
              min={10}
              max={240}
              step={5}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10min</span>
              <span>4h</span>
            </div>
          </div>

          {/* Recorrência */}
          <div className="space-y-1.5">
            <Label>Recorrência</Label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: "daily", label: "Diário" },
                { value: "weekly", label: "Semanal" },
                { value: "monthly", label: "Mensal" },
                { value: "once", label: "Avulso" },
              ].map((r) => (
                <Button
                  key={r.value}
                  type="button"
                  size="sm"
                  variant={recurrenceType === r.value ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => setRecurrenceType(r.value)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Dias da semana */}
          {(recurrenceType === "weekly" || recurrenceType === "daily") && (
            <div className="space-y-1.5">
              <Label>Dias da semana</Label>
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map((label, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    size="sm"
                    variant={daysOfWeek.includes(idx) ? "default" : "outline"}
                    className="h-9 text-xs px-0"
                    onClick={() => toggleDay(idx)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recorrência mensal */}
          {recurrenceType === "monthly" && (
            <div className="space-y-1.5">
              <Label>Dia do mês</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={recurrenceDayOfMonth}
                onChange={(e) => setRecurrenceDayOfMonth(e.target.value)}
              />
            </div>
          )}

          {/* Recorrência avulsa */}
          {recurrenceType === "once" && (
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !recurrenceDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurrenceDate ? format(recurrenceDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={recurrenceDate}
                    onSelect={setRecurrenceDate}
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Atribuição */}
          <div className="space-y-1.5">
            <Label>Atribuir a</Label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: "operator", label: "Colaborador" },
                { value: "sector", label: "Setor" },
                { value: "any", label: "Qualquer um" },
              ].map((a) => (
                <Button
                  key={a.value}
                  type="button"
                  size="sm"
                  variant={assignType === a.value ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => setAssignType(a.value as any)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {assignType === "operator" && (
            <div className="space-y-1.5">
              <Label>Colaborador</Label>
              <Select value={operatorId} onValueChange={setOperatorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {operators.filter((o) => o.is_active).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {o.name.charAt(0).toUpperCase()}
                        </span>
                        {o.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {assignType === "sector" && (
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Select value={assignedSector} onValueChange={(v) => setAssignedSector(v as ChecklistSector)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
                    <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Configurações avançadas */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-xs h-8 text-muted-foreground">
                Configurações avançadas
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notificar se atrasado</p>
                  <p className="text-xs text-muted-foreground">Alerta o gestor se não concluído no prazo</p>
                </div>
                <Switch checked={notifyOnOverdue} onCheckedChange={setNotifyOnOverdue} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Permitir conclusão tardia</p>
                  <p className="text-xs text-muted-foreground">Permite finalizar após o prazo</p>
                </div>
                <Switch checked={allowLateCompletion} onCheckedChange={setAllowLateCompletion} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Exigir foto</p>
                  <p className="text-xs text-muted-foreground">Foto obrigatória ao concluir</p>
                </div>
                <Switch checked={requirePhoto} onCheckedChange={setRequirePhoto} />
              </div>
              <div className="space-y-1.5">
                <Label>Observação interna</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nota visível apenas para gestores..."
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer fixo */}
        <div className="p-4 border-t flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!checklistId}>Salvar</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
