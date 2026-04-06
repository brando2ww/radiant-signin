import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake } from "lucide-react";

export default function ClientsBirthdays() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aniversariantes</h1>
        <p className="text-sm text-muted-foreground">Clientes com aniversário nos próximos dias</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cake className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página mostrará clientes com aniversário nos próximos 7, 15 e 30 dias com filtro e contagem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
