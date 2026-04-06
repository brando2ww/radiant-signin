import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ClientsManagement() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Clientes</h1>
        <p className="text-sm text-muted-foreground">Lista de clientes agrupados com busca e filtros</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página mostrará tabela de clientes agrupados por WhatsApp, com busca, última avaliação, NPS médio e total.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
