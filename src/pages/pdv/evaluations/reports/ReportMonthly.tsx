import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function ReportMonthly() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatório Mensal</h1>
        <p className="text-sm text-muted-foreground">Análise consolidada do mês com NPS, satisfação e distribuições</p>
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
            Esta página mostrará NPS donut, satisfação por dia da semana, faixa etária e exportação CSV.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
