import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function ReportDaily() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatório Diário</h1>
        <p className="text-sm text-muted-foreground">Resumo das avaliações do dia atual</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página mostrará o resumo diário com respostas, NPS, satisfação e alertas negativos do dia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
