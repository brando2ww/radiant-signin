import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ShiftData {
  name: string;
  total: number;
  completed: number;
  late: number;
  pct: number;
}

export function ShiftComparison({ data }: { data: ShiftData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Comparativo de Turnos</CardTitle></CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
          Sem dados para hoje
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparativo de Turnos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((shift) => (
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
            <p className="text-xs text-muted-foreground">
              {shift.completed}/{shift.total} concluídos
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
