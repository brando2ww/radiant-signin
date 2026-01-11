import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivityLogs, ActionType, EntityType } from '@/hooks/use-activity-logs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  LogIn, 
  LogOut, 
  Download, 
  Upload, 
  Database,
  RefreshCw,
  Filter,
  CreditCard,
  Wallet,
  Receipt,
  Target,
  Settings,
  Users
} from 'lucide-react';

interface ActivityLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actionIcons: Record<ActionType, React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <Pencil className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  export: <Download className="h-4 w-4" />,
  import: <Upload className="h-4 w-4" />,
  backup: <Database className="h-4 w-4" />,
  restore: <RefreshCw className="h-4 w-4" />,
};

const actionLabels: Record<ActionType, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
  export: 'Exportação',
  import: 'Importação',
  backup: 'Backup',
  restore: 'Restauração',
};

const actionColors: Record<ActionType, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  login: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  export: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  import: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  backup: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  restore: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
};

const entityIcons: Record<EntityType, React.ReactNode> = {
  transaction: <Receipt className="h-4 w-4" />,
  bank_account: <Wallet className="h-4 w-4" />,
  credit_card: <CreditCard className="h-4 w-4" />,
  bill: <Receipt className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  lead: <Users className="h-4 w-4" />,
  auth: <LogIn className="h-4 w-4" />,
  backup: <Database className="h-4 w-4" />,
};

const entityLabels: Record<EntityType, string> = {
  transaction: 'Transação',
  bank_account: 'Conta Bancária',
  credit_card: 'Cartão de Crédito',
  bill: 'Conta a Pagar',
  goal: 'Meta',
  settings: 'Configurações',
  lead: 'Lead',
  auth: 'Autenticação',
  backup: 'Backup',
};

export const ActivityLogsDialog = ({ open, onOpenChange }: ActivityLogsDialogProps) => {
  const { logs, isLoading } = useActivityLogs(100);
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Logs de Atividade</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as entidades</SelectItem>
                {Object.entries(entityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {entityIcons[log.entity_type as EntityType] || <Database className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={actionColors[log.action as ActionType] || 'bg-gray-100'}>
                        {actionIcons[log.action as ActionType]}
                        <span className="ml-1">{actionLabels[log.action as ActionType] || log.action}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entityLabels[log.entity_type as EntityType] || log.entity_type}
                      </span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {JSON.stringify(log.details).slice(0, 100)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
