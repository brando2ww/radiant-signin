import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SHIFTS = [
  { key: "manha", label: "Manhã" },
  { key: "tarde", label: "Tarde" },
  { key: "noite", label: "Noite" },
];

interface Props {
  schedules: any[];
  onEdit: (id: string) => void;
  onCreateAt: (day: number, shift: string) => void;
}

export function ScheduleWeekGrid({ schedules, onEdit, onCreateAt }: Props) {
  const getCell = (day: number, shift: string) =>
    schedules.filter(
      (s: any) =>
        s.is_active &&
        s.shift === shift &&
        ((s.days_of_week as number[]) || []).includes(day)
    );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-muted/50">
        <div className="p-2 text-xs font-medium text-muted-foreground border-r" />
        {DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className={cn(
              "p-2 text-xs font-medium text-center border-r last:border-r-0",
              i === new Date().getDay() && "bg-primary/10 text-primary font-bold"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Rows */}
      {SHIFTS.map((shift) => (
        <div key={shift.key} className="grid grid-cols-[80px_repeat(7,1fr)] border-t">
          <div className="p-2 text-xs font-medium text-muted-foreground flex items-start justify-center border-r bg-muted/30">
            {shift.label}
          </div>
          {DAY_LABELS.map((_, dayIdx) => {
            const items = getCell(dayIdx, shift.key);
            return (
              <div
                key={dayIdx}
                className={cn(
                  "min-h-[80px] p-1 border-r last:border-r-0 cursor-pointer hover:bg-muted/20 transition-colors relative group",
                  dayIdx === new Date().getDay() && "bg-primary/5"
                )}
                onClick={() => {
                  if (items.length === 0) onCreateAt(dayIdx, shift.key);
                }}
              >
                {items.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  {items.map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-stretch rounded text-[10px] bg-card border shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(s.id);
                      }}
                    >
                      <div
                        className="w-1 shrink-0 rounded-l"
                        style={{ backgroundColor: s.checklists?.color || "#6366f1" }}
                      />
                      <div className="p-1 min-w-0">
                        <p className="font-medium truncate">{s.checklists?.name || "Checklist"}</p>
                        <p className="text-muted-foreground">
                          {(s.start_time || "").slice(0, 5)}
                          {s.checklist_operators?.name && ` · ${s.checklist_operators.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
