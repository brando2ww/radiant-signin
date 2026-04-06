import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function CouponsManagement() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Cupons</h1>
        <p className="text-sm text-muted-foreground">Lista completa de cupons com status e filtros</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página mostrará todos os cupons com status, busca e filtro por campanha.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
