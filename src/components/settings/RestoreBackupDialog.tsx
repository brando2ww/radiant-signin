import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { logActivityDirect } from '@/hooks/use-activity-logs';
import { Upload, FileJson, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface RestoreBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BackupData {
  version: string;
  exported_at: string;
  transactions?: unknown[];
  bank_accounts?: unknown[];
  credit_cards?: unknown[];
  bills?: unknown[];
  monthly_goals?: unknown[];
  user_settings?: unknown[];
}

interface BackupPreview {
  transactions: number;
  bank_accounts: number;
  credit_cards: number;
  bills: number;
  goals: number;
  settings: number;
}

export const RestoreBackupDialog = ({ open, onOpenChange }: RestoreBackupDialogProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'preview' | 'restoring' | 'complete'>('upload');
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetState = () => {
    setStep('upload');
    setBackupData(null);
    setPreview(null);
    setRestoreMode('merge');
    setError(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateBackup = (data: unknown): data is BackupData => {
    if (!data || typeof data !== 'object') return false;
    const backup = data as BackupData;
    return typeof backup.version === 'string' && typeof backup.exported_at === 'string';
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (!file.name.endsWith('.json')) {
      setError('O arquivo deve ser um JSON válido');
      return;
    }

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (!validateBackup(data)) {
        setError('Formato de backup inválido. Certifique-se de usar um arquivo gerado pelo sistema.');
        return;
      }

      setBackupData(data);
      setPreview({
        transactions: data.transactions?.length || 0,
        bank_accounts: data.bank_accounts?.length || 0,
        credit_cards: data.credit_cards?.length || 0,
        bills: data.bills?.length || 0,
        goals: data.monthly_goals?.length || 0,
        settings: data.user_settings?.length || 0,
      });
      setStep('preview');
    } catch {
      setError('Erro ao processar o arquivo. Verifique se é um JSON válido.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRestore = async () => {
    if (!user || !backupData) return;

    setStep('restoring');

    try {
      // If replace mode, delete existing data first
      if (restoreMode === 'replace') {
        await Promise.all([
          supabase.from('transactions').delete().eq('user_id', user.id),
          supabase.from('bank_accounts').delete().eq('user_id', user.id),
          supabase.from('credit_cards').delete().eq('user_id', user.id),
          supabase.from('bills').delete().eq('user_id', user.id),
          supabase.from('monthly_goals').delete().eq('user_id', user.id),
        ]);
      }

      // Restore data - using any to bypass strict typing for backup restore
      if (backupData.transactions && backupData.transactions.length > 0) {
        for (const t of backupData.transactions) {
          const transaction = t as Record<string, unknown>;
          const { id: _id, user_id: _uid, ...rest } = transaction;
          await supabase.from('transactions').insert([{ ...rest, user_id: user.id } as any]);
        }
      }

      if (backupData.bank_accounts && backupData.bank_accounts.length > 0) {
        for (const a of backupData.bank_accounts) {
          const account = a as Record<string, unknown>;
          const { id: _id, user_id: _uid, ...rest } = account;
          await supabase.from('bank_accounts').insert([{ ...rest, user_id: user.id } as any]);
        }
      }

      if (backupData.credit_cards && backupData.credit_cards.length > 0) {
        for (const c of backupData.credit_cards) {
          const card = c as Record<string, unknown>;
          const { id: _id, user_id: _uid, ...rest } = card;
          await supabase.from('credit_cards').insert([{ ...rest, user_id: user.id } as any]);
        }
      }

      if (backupData.bills && backupData.bills.length > 0) {
        for (const b of backupData.bills) {
          const bill = b as Record<string, unknown>;
          const { id: _id, user_id: _uid, parent_bill_id: _pbi, ...rest } = bill;
          await supabase.from('bills').insert([{ ...rest, user_id: user.id, parent_bill_id: null } as any]);
        }
      }

      if (backupData.monthly_goals && backupData.monthly_goals.length > 0) {
        for (const g of backupData.monthly_goals) {
          const goal = g as Record<string, unknown>;
          const { id: _id, user_id: _uid, ...rest } = goal;
          await supabase.from('monthly_goals').insert([{ ...rest, user_id: user.id } as any]);
        }
      }

      // Log the activity
      await logActivityDirect(user.id, 'restore', 'backup', undefined, {
        mode: restoreMode,
        transactions: preview?.transactions || 0,
        bank_accounts: preview?.bank_accounts || 0,
        credit_cards: preview?.credit_cards || 0,
        bills: preview?.bills || 0,
        goals: preview?.goals || 0,
      });

      setStep('complete');
      toast({
        title: 'Backup restaurado!',
        description: 'Seus dados foram restaurados com sucesso.',
      });
    } catch (err) {
      console.error('Error restoring backup:', err);
      setError('Erro ao restaurar backup. Tente novamente.');
      setStep('preview');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restaurar Backup</DialogTitle>
          <DialogDescription>
            Restaure seus dados a partir de um arquivo de backup JSON.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste e solte seu arquivo de backup aqui
              </p>
              <p className="text-xs text-muted-foreground mb-4">ou</p>
              <label htmlFor="backup-upload">
                <Button variant="outline" asChild>
                  <span>Selecionar arquivo</span>
                </Button>
                <input
                  id="backup-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'preview' && preview && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileJson className="h-5 w-5 text-primary" />
                <span className="font-medium">Conteúdo do Backup</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transações:</span>
                  <Badge variant="secondary">{preview.transactions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contas:</span>
                  <Badge variant="secondary">{preview.bank_accounts}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cartões:</span>
                  <Badge variant="secondary">{preview.credit_cards}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faturas:</span>
                  <Badge variant="secondary">{preview.bills}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metas:</span>
                  <Badge variant="secondary">{preview.goals}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Modo de restauração:</Label>
              <RadioGroup value={restoreMode} onValueChange={(v) => setRestoreMode(v as 'merge' | 'replace')}>
                <div className="flex items-start space-x-3 p-3 rounded-lg border">
                  <RadioGroupItem value="merge" id="merge" className="mt-1" />
                  <div>
                    <Label htmlFor="merge" className="font-medium cursor-pointer">Mesclar</Label>
                    <p className="text-sm text-muted-foreground">
                      Adiciona os dados do backup aos seus dados atuais
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/50">
                  <RadioGroupItem value="replace" id="replace" className="mt-1" />
                  <div>
                    <Label htmlFor="replace" className="font-medium cursor-pointer">Substituir</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove todos os dados atuais e restaura apenas o backup
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {restoreMode === 'replace' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Atenção: todos os seus dados atuais serão excluídos permanentemente!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetState}>
                Voltar
              </Button>
              <Button onClick={handleRestore}>
                Restaurar Backup
              </Button>
            </div>
          </div>
        )}

        {step === 'restoring' && (
          <div className="py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Restaurando seus dados...</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-4" />
            <p className="font-medium mb-2">Backup restaurado com sucesso!</p>
            <p className="text-sm text-muted-foreground mb-4">
              Seus dados foram restaurados. Recarregue a página para ver as alterações.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
