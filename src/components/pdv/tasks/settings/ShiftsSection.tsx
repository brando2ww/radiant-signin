import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { ShiftConfig } from "@/hooks/use-operational-tasks";

const COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b",
  "#ef4444", "#ec4899", "#a855f7", "#f97316", "#64748b",
];

const DAYS = [
  { key: "dom", label: "D" },
  { key: "seg", label: "S" },
  { key: "ter", label: "T" },
  { key: "qua", label: "Q" },
  { key: "qui", label: "Q" },
  { key: "sex", label: "S" },
  { key: "sab", label: "S" },
];

interface Props {
  shifts: ShiftConfig[];
  onChange: (shifts: ShiftConfig[]) => void;
}

function hasOverlap(shifts: ShiftConfig[]): { i: number; j: number } | null {
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const a = shifts[i], b = shifts[j];
      if (!a.start || !a.end || !b.start || !b.end) continue;
      const aDays = a.activeDays || DAYS.map(d => d.key);
      const bDays = b.activeDays || DAYS.map(d => d.key);
      const sharedDays = aDays.filter(d => bDays.includes(d));
      if (sharedDays.length === 0) continue;
      if (a.start < b.end && a.end > b.start) return { i, j };
    }
  }
  return null;
}

export function ShiftsSection({ shifts, onChange }: Props) {
  const overlap = hasOverlap(shifts);

  const update = (idx: number, field: keyof ShiftConfig, value: any) => {
    const updated = [...shifts];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const toggleDay = (idx: number, day: string) => {
    const current = shifts[idx].activeDays || DAYS.map(d => d.key);
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    update(idx, "activeDays", updated);
  };

  const add = () => onChange([...shifts, { name: "", start: "00:00", end: "00:00", color: "#6366f1", activeDays: DAYS.map(d => d.key) }]);
  const remove = (idx: number) => onChange(shifts.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {overlap && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Os turnos "{shifts[overlap.i].name || overlap.i + 1}" e "{shifts[overlap.j].name || overlap.j + 1}" têm horários sobrepostos.
        </div>
      )}

      {shifts.map((s, i) => {
        const isOverlap = overlap && (overlap.i === i || overlap.j === i);
        return (
          <div key={i} className={`space-y-3 rounded-lg border p-4 ${isOverlap ? "border-destructive bg-destructive/5" : "border-border"}`}>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Nome</Label>
                <Input value={s.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Ex: Abertura" />
              </div>
              <div className="w-28">
                <Label className="text-xs">Início</Label>
                <Input type="time" value={s.start} onChange={(e) => update(i, "start", e.target.value)} />
              </div>
              <div className="w-28">
                <Label className="text-xs">Fim</Label>
                <Input type="time" value={s.end} onChange={(e) => update(i, "end", e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label className="text-xs">Cor</Label>
                <div className="flex gap-1.5 mt-1">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update(i, "color", c)}
                      className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: s.color === c ? "hsl(var(--foreground))" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="ml-auto">
                <Label className="text-xs">Dias ativos</Label>
                <div className="flex gap-1 mt-1">
                  {DAYS.map((d) => {
                    const active = (s.activeDays || DAYS.map(x => x.key)).includes(d.key);
                    return (
                      <button
                        key={d.key}
                        onClick={() => toggleDay(i, d.key)}
                        className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Adicionar Turno
      </Button>
    </div>
  );
}
