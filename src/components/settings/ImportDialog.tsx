import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import {
  parseCSV,
  parseOFX,
  detectFileType,
  type ParsedTransaction,
  type ParseResult,
} from "@/lib/bank-statement-parser";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'success';

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [importedCount, setImportedCount] = useState(0);

  const { bankAccounts } = useBankAccounts();
  const { createTransaction } = useTransactions();

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setSelectedAccountId('');
    setImportedCount(0);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetState, 300);
  }, [onOpenChange, resetState]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    try {
      const content = await selectedFile.text();
      const fileType = detectFileType(content);

      let result: ParseResult;
      if (fileType === 'csv') {
        result = parseCSV(content);
      } else if (fileType === 'ofx') {
        result = parseOFX(content);
      } else {
        result = {
          transactions: [],
          errors: ['Formato de arquivo não reconhecido. Use CSV ou OFX.'],
          warnings: [],
        };
      }

      setParseResult(result);
      if (result.transactions.length > 0) {
        setStep('preview');
      }
    } catch (error) {
      setParseResult({
        transactions: [],
        errors: ['Erro ao ler o arquivo. Verifique se o arquivo não está corrompido.'],
        warnings: [],
      });
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  }, [handleFileChange]);

  const handleImport = useCallback(async () => {
    if (!parseResult || parseResult.transactions.length === 0) return;

    setStep('importing');
    let successCount = 0;

    for (const transaction of parseResult.transactions) {
      try {
        createTransaction({
          type: transaction.type,
          amount: transaction.amount,
          category: 'Outros',
          description: transaction.description,
          transaction_date: transaction.date,
        });
        successCount++;
      } catch (error) {
        console.error('Erro ao importar transação:', error);
      }
    }

    setImportedCount(successCount);
    setStep('success');
    toast.success(`${successCount} transações importadas com sucesso!`);
  }, [parseResult, selectedAccountId, createTransaction]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
          <DialogDescription>
            Importe transações de arquivos CSV ou OFX
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste um arquivo CSV ou OFX aqui
              </p>
              <p className="text-xs text-muted-foreground">
                ou clique para selecionar
              </p>
              <Input
                id="file-input"
                type="file"
                accept=".csv,.ofx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {parseResult?.errors.map((error, i) => (
              <Alert key={i} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>CSV:</strong> O arquivo deve ter colunas de Data, Valor e opcionalmente Descrição</p>
              <p><strong>OFX:</strong> Formato padrão exportado por bancos brasileiros</p>
            </div>
          </div>
        )}

        {step === 'preview' && parseResult && (
          <div className="space-y-4">
            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {parseResult.transactions.length} transações
                </Badge>
              </div>
            )}

            {parseResult.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {parseResult.warnings.length} aviso(s) durante a leitura do arquivo
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Conta Bancária (opcional)</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="">Nenhuma conta</SelectItem>
                  {bankAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.transactions.slice(0, 50).map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{format(t.date, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={t.type === 'income' ? 'default' : 'secondary'}>
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {t.description}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          t.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {parseResult.transactions.length > 50 && (
                <div className="p-2 text-center text-sm text-muted-foreground border-t">
                  Mostrando 50 de {parseResult.transactions.length} transações
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetState}>
                Voltar
              </Button>
              <Button onClick={handleImport}>
                Importar {parseResult.transactions.length} transações
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 text-center">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Importando transações...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 mb-4" />
            <p className="text-lg font-medium mb-2">Importação concluída!</p>
            <p className="text-sm text-muted-foreground mb-6">
              {importedCount} transações foram importadas com sucesso.
            </p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
