import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Share, Plus } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !isInstallable) return null;

  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS install instructions
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
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">Instalar App</h3>
            {isIOS ? (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Para instalar este app no seu iPhone:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Toque no ícone <Share className="h-3 w-3 inline" /> de compartilhar
                  </li>
                  <li>
                    Role para baixo e toque em "Adicionar à Tela de Início"{" "}
                    <Plus className="h-3 w-3 inline" />
                  </li>
                  <li>Toque em "Adicionar"</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Instale o app para acesso rápido e uso offline.
              </p>
            )}
            <div className="flex gap-2">
              {!isIOS && (
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
