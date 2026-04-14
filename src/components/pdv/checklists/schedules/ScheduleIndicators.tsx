import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Clock, TrendingUp, Activity } from "lucide-react";

const SHIFT_LABELS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

interface Props {
  schedules: any[];
}

export function ScheduleIndicators({ schedules }: Props) {
  const active = schedules.filter((s) => s.is_active);
  const today = new Date().getDay();

  const todayCount = active.filter((s) => {
    const days = (s.days_of_week as number[]) || [];
    return days.includes(today);
  }).length;

  const shiftCounts: Record<string, number> = {};
  active.forEach((s) => {
    shiftCounts[s.shift] = (shiftCounts[s.shift] || 0) + 1;
  });
  const busiestShift = Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0];

  const todaySchedules = active
    .filter((s) => ((s.days_of_week as number[]) || []).includes(today))
    .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = todaySchedules.find((s: any) => {
    const [h, m] = (s.start_time || "00:00").split(":").map(Number);
    return h * 60 + m > nowMinutes;
  });

  const nextLabel = next
    ? `${next.checklists?.name || "Checklist"} às ${(next.start_time || "").slice(0, 5)}`
    : "Nenhum restante";

  const items = [
    { icon: Activity, label: "Ativos", value: String(active.length), color: "text-primary" },
    { icon: CalendarCheck, label: "Hoje", value: String(todayCount), color: "text-emerald-500" },
    { icon: TrendingUp, label: "Turno mais ativo", value: busiestShift ? SHIFT_LABELS[busiestShift[0]] || busiestShift[0] : "—", color: "text-amber-500" },
    { icon: Clock, label: "Próximo", value: nextLabel, color: "text-blue-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold truncate">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
