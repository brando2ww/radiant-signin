import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Copy, Pause, Play, Trash2, Clock } from "lucide-react";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const SHIFT_LABELS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

interface Props {
  schedules: any[];
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduleListView({ schedules, onEdit, onDuplicate, onToggle, onDelete }: Props) {
  const sorted = [...schedules].sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum agendamento encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[4px_1fr_100px_80px_140px_120px_70px_60px_120px] bg-muted/50 text-[11px] font-medium text-muted-foreground">
        <div />
        <div className="p-2">Checklist</div>
        <div className="p-2">Setor</div>
        <div className="p-2">Turno</div>
        <div className="p-2">Dias</div>
        <div className="p-2">Responsável</div>
        <div className="p-2">Horário</div>
        <div className="p-2">Prazo</div>
        <div className="p-2 text-right">Ações</div>
      </div>
      {sorted.map((s: any) => {
        const days = (s.days_of_week as number[]) || [];
        const sector = s.checklists?.sector as ChecklistSector | undefined;
        return (
          <div
            key={s.id}
            className={`grid grid-cols-[4px_1fr_100px_80px_140px_120px_70px_60px_120px] border-t items-center text-xs hover:bg-muted/20 transition-colors ${!s.is_active ? "opacity-50" : ""}`}
          >
            <div className="h-full" style={{ backgroundColor: s.checklists?.color || "#6366f1" }} />
            <div className="p-2 font-medium truncate">{s.checklists?.name || "Checklist"}</div>
            <div className="p-2 text-muted-foreground">{sector ? SECTOR_LABELS[sector] : "—"}</div>
            <div className="p-2">
              <Badge variant="secondary" className="text-[10px]">{SHIFT_LABELS[s.shift] || s.shift}</Badge>
            </div>
            <div className="p-2 flex gap-0.5">
              {DAY_LABELS.map((d, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center ${
                    days.includes(i) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="p-2 text-muted-foreground truncate">
              {s.checklist_operators?.name || (s.assigned_sector ? SECTOR_LABELS[s.assigned_sector as ChecklistSector] : "—")}
            </div>
            <div className="p-2 flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {(s.start_time || "").slice(0, 5)}
            </div>
            <div className="p-2 text-muted-foreground">{s.max_duration_minutes}min</div>
            <div className="p-2 flex justify-end gap-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(s.id)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDuplicate(s.id)}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggle(s.id)}>
                {s.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(s.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
