import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useChecklistSchedules } from "@/hooks/use-checklist-schedules";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import type { Database } from "@/integrations/supabase/types";

type ChecklistRow = Database["public"]["Tables"]["checklists"]["Row"];
type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SHIFT_OPTIONS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  schedules: any[];
  checklists: ChecklistRow[];
  operators: OperatorRow[];
}

export function ScheduleDialog({ open, onOpenChange, editingId, schedules, checklists, operators }: Props) {
  const { createSchedule, updateSchedule } = useChecklistSchedules();
  const editing = editingId ? schedules.find((s: any) => s.id === editingId) : null;

  const [checklistId, setChecklistId] = useState("");
  const [shift, setShift] = useState("manha");
  const [startTime, setStartTime] = useState("08:00");
  const [maxDuration, setMaxDuration] = useState("60");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [assignType, setAssignType] = useState<"operator" | "sector">("operator");
  const [operatorId, setOperatorId] = useState<string>("");
  const [assignedSector, setAssignedSector] = useState<ChecklistSector>("cozinha");

  useEffect(() => {
    if (editing) {
      setChecklistId(editing.checklist_id);
      setShift(editing.shift);
      setStartTime(editing.start_time?.slice(0, 5) || "08:00");
      setMaxDuration(String(editing.max_duration_minutes));
      setDaysOfWeek((editing.days_of_week as number[]) || [1, 2, 3, 4, 5]);
      if (editing.assigned_operator_id) {
        setAssignType("operator");
        setOperatorId(editing.assigned_operator_id);
      } else {
        setAssignType("sector");
        setAssignedSector(editing.assigned_sector || "cozinha");
      }
    } else {
      setChecklistId(checklists[0]?.id || "");
      setShift("manha");
      setStartTime("08:00");
      setMaxDuration("60");
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setAssignType("operator");
      setOperatorId("");
      setAssignedSector("cozinha");
    }
  }, [editing, open, checklists]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const handleSave = async () => {
    const data = {
      checklist_id: checklistId,
      shift,
      start_time: startTime,
      max_duration_minutes: Number(maxDuration),
      days_of_week: daysOfWeek,
      assigned_operator_id: assignType === "operator" && operatorId ? operatorId : null,
      assigned_sector: assignType === "sector" ? assignedSector : null,
    };

    if (editing) {
      updateSchedule({ id: editing.id, ...data });
    } else {
      await createSchedule(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Checklist</Label>
            <Select value={checklistId} onValueChange={setChecklistId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {checklists.map((cl) => (
                  <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Turno</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SHIFT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Horário de início</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Prazo máximo (minutos)</Label>
            <Input type="number" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} />
          </div>

          <div>
            <Label className="mb-2 block">Dias da semana</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((label, idx) => (
                <label key={idx} className="flex items-center gap-1.5 text-sm">
                  <Checkbox checked={daysOfWeek.includes(idx)} onCheckedChange={() => toggleDay(idx)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Atribuir a</Label>
            <Select value={assignType} onValueChange={(v) => setAssignType(v as "operator" | "sector")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Colaborador específico</SelectItem>
                <SelectItem value="sector">Setor inteiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assignType === "operator" ? (
            <div>
              <Label>Colaborador</Label>
              <Select value={operatorId} onValueChange={setOperatorId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {operators.filter((o) => o.is_active).map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name} ({o.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Setor</Label>
              <Select value={assignedSector} onValueChange={(v) => setAssignedSector(v as ChecklistSector)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
                    <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!checklistId}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
