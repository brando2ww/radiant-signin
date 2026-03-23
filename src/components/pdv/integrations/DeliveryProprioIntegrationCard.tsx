import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink } from "lucide-react";

export function DeliveryProprioIntegrationCard() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              Delivery Próprio
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Integrado
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sistema de delivery nativo da Velara, integrado ao seu PDV
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            O módulo de Delivery Próprio já está disponível no seu PDV. Acesse para configurar seu cardápio online, gerenciar pedidos e personalizar a experiência do cliente.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/pdv/delivery/cardapio")}>
            Cardápio
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/pdv/delivery/pedidos")}>
            Pedidos
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/pdv/delivery/personalizacao")}>
            Personalização
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/pdv/delivery/configuracoes")}>
            Configurações
          </Button>
        </div>

        <Button className="w-full gap-2" onClick={() => navigate("/pdv/delivery/pedidos")}>
          <ExternalLink className="h-4 w-4" />
          Acessar Módulo Delivery
        </Button>

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>• Cardápio online personalizável com link público</p>
          <p>• Gestão de pedidos em tempo real com Kanban</p>
          <p>• Cupons de desconto e promoções</p>
          <p>• Relatórios completos de vendas e entregas</p>
        </div>
      </CardContent>
    </Card>
  );
}
