import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot } from "lucide-react";

export default function CouponsRoulettes() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roletas</h1>
        <p className="text-sm text-muted-foreground">Visão consolidada de todas as roletas das campanhas</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CircleDot className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página mostrará todas as roletas de todas as campanhas com probabilidades e prêmios configurados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
