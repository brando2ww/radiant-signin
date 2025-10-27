import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink } from "lucide-react";

export function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integrações Disponíveis
          </CardTitle>
          <CardDescription>
            Conecte seu PDV com plataformas de delivery e outras ferramentas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">iFood</h3>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba pedidos do iFood diretamente no seu PDV
                </p>
              </div>
              <Button disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              • Sincronização automática de cardápio<br />
              • Recebimento de pedidos em tempo real<br />
              • Atualização de status automaticamente
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Rappi</h3>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integre com a plataforma Rappi para receber pedidos
                </p>
              </div>
              <Button disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Uber Eats</h3>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba pedidos do Uber Eats no seu sistema
                </p>
              </div>
              <Button disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Delivery Próprio</h3>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sistema de delivery integrado da Velara
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/delivery" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Configurar
                </a>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              • Cardápio online personalizável<br />
              • Gestão completa de pedidos<br />
              • Link público para compartilhar
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
