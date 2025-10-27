import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download, Check, Smartphone, Zap, Wifi, Share, Plus } from "lucide-react";
import { toast } from "sonner";

const InstallApp = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();

  const handleInstall = async () => {
    if (isIOS) {
      toast.info(
        "Para instalar no iPhone: Toque em 'Compartilhar' e depois em 'Adicionar à Tela de Início'",
        { duration: 8000 }
      );
      return;
    }

    const success = await installApp();
    if (success) {
      toast.success("App instalado com sucesso!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Smartphone className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Instale o App Velara</h1>
          <p className="text-xl text-muted-foreground">
            Acesso rápido e experiência otimizada para mobile
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vantagens do App Instalado</CardTitle>
            <CardDescription>
              Aproveite todos os recursos mesmo offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Acesso Instantâneo</h3>
                <p className="text-sm text-muted-foreground">
                  Abra direto da tela inicial, sem precisar abrir o navegador
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Funciona Offline</h3>
                <p className="text-sm text-muted-foreground">
                  Navegue pelo cardápio mesmo sem conexão com a internet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Experiência Mobile</h3>
                <p className="text-sm text-muted-foreground">
                  Interface otimizada para seu celular ou tablet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isInstalled ? (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">App já instalado!</h3>
                <p className="text-sm text-muted-foreground">
                  Você pode acessar o app pela tela inicial do seu dispositivo
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Como instalar no iPhone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    1
                  </span>
                  <div>
                    Toque no ícone <Share className="h-4 w-4 inline" /> de compartilhar na
                    barra inferior do Safari
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    2
                  </span>
                  <div>
                    Role para baixo e toque em "Adicionar à Tela de Início"{" "}
                    <Plus className="h-4 w-4 inline" />
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    3
                  </span>
                  <div>Toque em "Adicionar" no canto superior direito</div>
                </li>
              </ol>
              <Button className="w-full mt-6" onClick={handleInstall}>
                Ver Instruções
              </Button>
            </CardContent>
          </Card>
        ) : isInstallable ? (
          <Button size="lg" className="w-full" onClick={handleInstall}>
            <Download className="h-5 w-5 mr-2" />
            Instalar Agora
          </Button>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>
                A instalação não está disponível neste dispositivo ou navegador.
              </p>
              <p className="text-sm mt-2">
                Tente acessar através do Chrome, Safari ou Edge.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Ao instalar, você concorda com nossos termos de uso e política de privacidade
        </p>
      </div>
    </div>
  );
};

export default InstallApp;
