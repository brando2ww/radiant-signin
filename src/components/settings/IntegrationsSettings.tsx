import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Database } from "lucide-react";

export function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importação de Dados</CardTitle>
          <CardDescription>Importe transações de arquivos externos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Importar Extrato Bancário</div>
              <p className="text-sm text-muted-foreground">Suporta formatos CSV e OFX</p>
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium flex items-center gap-2">
                Conectar Conta Bancária
                <Badge variant="secondary">Em Breve</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Sincronização automática com seu banco</p>
            </div>
            <Button disabled>
              <Database className="mr-2 h-4 w-4" />
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exportação de Dados</CardTitle>
          <CardDescription>Exporte seus dados financeiros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Exportar para CSV</div>
              <p className="text-sm text-muted-foreground">Todas as transações em formato CSV</p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Exportar para Excel</div>
              <p className="text-sm text-muted-foreground">Planilha formatada com gráficos</p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Backup Completo (JSON)</div>
              <p className="text-sm text-muted-foreground">Todos os dados incluindo configurações</p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Baixar Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
