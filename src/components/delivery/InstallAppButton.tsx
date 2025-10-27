import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const InstallAppButton = () => {
  const { user } = useAuth();

  const copyMenuLink = () => {
    const menuUrl = `${window.location.origin}/cardapio/${user?.id}`;
    navigator.clipboard.writeText(menuUrl);
    toast.success("Link copiado!", {
      description: "Compartilhe com seus clientes para eles acessarem o cardápio",
    });
  };

  const openInstallPage = () => {
    window.open("/instalar-app", "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          App Mobile para Clientes
        </CardTitle>
        <CardDescription>
          Seus clientes podem instalar o cardápio como um app no celular
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Link do Cardápio:</h4>
          <div className="flex gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-xs overflow-auto">
              {window.location.origin}/cardapio/{user?.id}
            </code>
            <Button size="sm" variant="outline" onClick={copyMenuLink}>
              Copiar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Vantagens do App:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Acesso rápido direto da tela inicial</li>
            <li>• Funciona offline</li>
            <li>• Experiência otimizada para mobile</li>
            <li>• Notificações de status do pedido</li>
          </ul>
        </div>

        <Button className="w-full" variant="outline" onClick={openInstallPage}>
          <Download className="h-4 w-4 mr-2" />
          Ver Página de Instalação
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
