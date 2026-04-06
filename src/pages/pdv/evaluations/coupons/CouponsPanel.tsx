import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function CouponsPanel() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Cupons</h1>
        <p className="text-sm text-muted-foreground">KPIs e visão geral dos cupons emitidos</p>
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
            Esta página mostrará cupons emitidos, resgatados, expirados e taxa de resgate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
