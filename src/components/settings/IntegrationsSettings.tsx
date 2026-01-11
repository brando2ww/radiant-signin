import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/use-transactions";
import { exportTransactionsToCSV, exportTransactionsToExcel, exportFullBackup } from "@/lib/export-utils";
import { ImportDialog } from "./ImportDialog";

export function IntegrationsSettings() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);

  const { transactions, isLoading } = useTransactions();

  const handleExportCSV = async () => {
    if (!transactions || transactions.length === 0) {
      toast.error('Nenhuma transação para exportar');
      return;
    }

    setExportingCSV(true);
    try {
      exportTransactionsToCSV(transactions);
      toast.success('Arquivo CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportExcel = async () => {
    if (!transactions || transactions.length === 0) {
      toast.error('Nenhuma transação para exportar');
      return;
    }

    setExportingExcel(true);
    try {
      exportTransactionsToExcel(transactions);
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      await exportFullBackup();
      toast.success('Backup completo exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar backup');
    } finally {
      setExportingBackup(false);
    }
  };

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
            <Button onClick={() => setImportDialogOpen(true)}>
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
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={isLoading || exportingCSV}
            >
              {exportingCSV ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar CSV
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Exportar para Excel</div>
              <p className="text-sm text-muted-foreground">Planilha formatada com resumo e categorias</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              disabled={isLoading || exportingExcel}
            >
              {exportingExcel ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar Excel
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Backup Completo (JSON)</div>
              <p className="text-sm text-muted-foreground">Todos os dados incluindo configurações</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportBackup}
              disabled={exportingBackup}
            >
              {exportingBackup ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Baixar Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <ImportDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen} 
      />
    </div>
  );
}
