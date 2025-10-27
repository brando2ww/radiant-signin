import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Smartphone, Zap, Bell, Wifi } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const AppInstallGuide = () => {
  const { user } = useAuth();
  const installUrl = user ? `${window.location.origin}/cardapio/${user.id}/instalar-app` : "";

  const handleOpenGuide = () => {
    window.open(installUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Mobile (PWA)</CardTitle>
        <CardDescription>
          Seu cardápio pode ser instalado como um aplicativo no celular dos clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Funciona Offline</h4>
              <p className="text-xs text-muted-foreground">
                Clientes podem ver o cardápio sem internet
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Carregamento Rápido</h4>
              <p className="text-xs text-muted-foreground">
                Abertura instantânea como um app nativo
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Notificações Push</h4>
              <p className="text-xs text-muted-foreground">
                Envie avisos sobre promoções (em breve)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Wifi className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Modo Offline</h4>
              <p className="text-xs text-muted-foreground">
                Cache inteligente para melhor experiência
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleOpenGuide} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Página de Instalação
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Compartilhe esta página com seus clientes para que eles instalem o app
          </p>
        </div>
      </CardContent>
    </Card>
  );
};