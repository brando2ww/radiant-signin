import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock } from "lucide-react";

export default function PDVKitchen() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cozinha</h1>
          <p className="text-muted-foreground">
            Acompanhamento de pedidos em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            0 pendentes
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pendentes</CardTitle>
            <CardDescription>Novos pedidos</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[500px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Em Preparo</CardTitle>
            <CardDescription>Sendo preparados</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[500px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prontos</CardTitle>
            <CardDescription>Aguardando entrega</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[500px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum pedido</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
