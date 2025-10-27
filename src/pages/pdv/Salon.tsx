import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Grid3x3 } from "lucide-react";

export default function PDVSalon() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salão</h1>
          <p className="text-muted-foreground">
            Gerencie suas mesas e atendimentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Configurar Layout
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mesa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de Mesas</CardTitle>
          <CardDescription>
            Clique em uma mesa para abrir ou gerenciar pedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[500px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Grid3x3 className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Nenhuma mesa cadastrada</h3>
              <p className="text-sm text-muted-foreground">
                Comece adicionando suas primeiras mesas
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mesa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
