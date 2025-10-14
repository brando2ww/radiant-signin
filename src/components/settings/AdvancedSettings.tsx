import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, RefreshCw, FileText } from "lucide-react";

export function AdvancedSettings() {
  const appVersion = "1.0.0";
  const buildDate = new Date().toLocaleDateString("pt-BR");

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Otimize o desempenho do aplicativo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Limpar Cache</div>
              <p className="text-sm text-muted-foreground">Remove dados temporários armazenados localmente</p>
            </div>
            <Button variant="outline" onClick={handleClearCache}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Recarregar Aplicação</div>
              <p className="text-sm text-muted-foreground">Atualiza a página e recarrega todos os dados</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
          <CardDescription>Gerencie backups dos seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium flex items-center gap-2">
                Backup Automático
                <Badge variant="secondary">Em Breve</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Agende backups automáticos periódicos</p>
            </div>
            <Button disabled>Configurar</Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium flex items-center gap-2">
                Restaurar de Backup
                <Badge variant="secondary">Em Breve</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Restaure seus dados de um backup anterior</p>
            </div>
            <Button disabled>Restaurar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs e Diagnóstico</CardTitle>
          <CardDescription>Ferramentas para desenvolvedores e suporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Visualizar Logs</div>
              <p className="text-sm text-muted-foreground">Acessar registro de atividades do sistema</p>
            </div>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Ver Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>Detalhes técnicos da aplicação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Versão:</span>
            <span className="text-sm font-medium">{appVersion}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Build:</span>
            <span className="text-sm font-medium">{buildDate}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Ambiente:</span>
            <Badge variant="outline">Produção</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
