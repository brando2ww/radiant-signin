import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dices } from "lucide-react";

export default function CouponsDraw() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sorteio</h1>
        <p className="text-sm text-muted-foreground">Histórico de sorteios realizados pela roleta</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dices className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página mostrará os sorteios realizados com resultado, data e cliente contemplado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
