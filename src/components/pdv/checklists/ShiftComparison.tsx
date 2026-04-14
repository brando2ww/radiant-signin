import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface ShiftData {
  name: string;
  total: number;
  completed: number;
  late: number;
  pct: number;
  bestOperator?: string | null;
  bestScore?: number | null;
}

const FIXED_SHIFTS = ["Manhã", "Tarde", "Noite"];

export function ShiftComparison({ data }: { data: ShiftData[] }) {
  // Merge data into fixed shifts
  const shiftMap = new Map(data.map((s) => [s.name, s]));
  const shifts = FIXED_SHIFTS.map((name) => shiftMap.get(name) || { name, total: 0, completed: 0, late: 0, pct: 0, bestOperator: null, bestScore: null });
  // Add any extra shifts not in FIXED_SHIFTS
  data.forEach((s) => {
    if (!FIXED_SHIFTS.includes(s.name)) shifts.push(s);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparativo de Turnos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shifts.map((shift) => (
          <div key={shift.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{shift.name}</span>
              <div className="flex items-center gap-2">
                {shift.late > 0 && (
                  <Badge variant="destructive" className="text-[10px]">{shift.late} atrasado(s)</Badge>
                )}
                <Badge variant="secondary">{shift.pct}%</Badge>
              </div>
            </div>
            <Progress value={shift.pct} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {shift.total === 0 ? "Sem tarefas" : `${shift.completed}/${shift.total} concluídos`}
              </p>
              {shift.bestOperator && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-yellow-600" />
                  {shift.bestOperator} {shift.bestScore != null && `(${shift.bestScore})`}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
