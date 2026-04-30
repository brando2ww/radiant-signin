import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePDVActionAudit } from "@/hooks/use-pdv-action-audit";
import { PDV_ACTION_LABEL } from "@/hooks/use-pdv-permissions";
import { Loader2 } from "lucide-react";

interface OperationHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId?: string | null;
  targetId?: string | null;
  title?: string;
}

export function OperationHistoryDialog({
  open,
  onOpenChange,
  sourceId,
  targetId,
  title = "Histórico de operações",
}: OperationHistoryDialogProps) {
  const { data: entries = [], isLoading } = usePDVActionAudit({
    sourceId: open ? sourceId : null,
    targetId: open ? targetId : null,
    limit: 100,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Auditoria de troca de mesa, transferências, encerramentos e pagamentos.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[420px] border rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Nenhuma ação registrada
            </p>
          ) : (
            <div className="divide-y">
              {entries.map((e) => (
                <div key={e.id} className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{PDV_ACTION_LABEL[e.action] ?? e.action}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(e.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.actor_role ?? "—"} · {e.actor_user_id.slice(0, 8)}
                  </p>
                  {e.reason && <p className="text-sm">{e.reason}</p>}
                  {e.payload && Object.keys(e.payload).length > 0 && (
                    <pre className="text-[10px] bg-muted rounded p-2 overflow-x-auto">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
