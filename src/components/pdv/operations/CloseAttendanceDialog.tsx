import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePDVCloseAttendance } from "@/hooks/use-pdv-close-attendance";
import { usePDVPermissions } from "@/hooks/use-pdv-permissions";
import { Loader2 } from "lucide-react";

interface CloseAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comandaId: string | null;
  hasOrder: boolean; // true se há mesa associada
  onClosed?: () => void;
}

export function CloseAttendanceDialog({
  open,
  onOpenChange,
  comandaId,
  hasOrder,
  onClosed,
}: CloseAttendanceDialogProps) {
  const { closeAttendance, isClosing } = usePDVCloseAttendance();
  const { requiresReason } = usePDVPermissions();
  const [reason, setReason] = useState("");
  const [closeWholeTable, setCloseWholeTable] = useState(false);

  const reasonRequired = requiresReason("close_attendance");

  const handleConfirm = async () => {
    if (!comandaId) return;
    if (reasonRequired && reason.trim().length < 3) return;
    await closeAttendance({
      comandaId,
      closeWholeTable,
      reason: reason.trim() || null,
    });
    onClosed?.();
    setReason("");
    setCloseWholeTable(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Encerrar atendimento</AlertDialogTitle>
          <AlertDialogDescription>
            A comanda será marcada como <strong>aguardando pagamento</strong> e enviada ao caixa.
            Não será possível lançar novos itens, e a mesa só será liberada após o pagamento ser
            finalizado pelo caixa.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          {hasOrder && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="whole-table" className="text-sm font-medium">
                  Encerrar mesa inteira
                </Label>
                <p className="text-xs text-muted-foreground">
                  Encerra todas as comandas desta mesa
                </p>
              </div>
              <Switch
                id="whole-table"
                checked={closeWholeTable}
                onCheckedChange={setCloseWholeTable}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-sm">
              Observação {reasonRequired && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Opcional: forma de pagamento desejada, divisão da conta, etc."
              rows={2}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isClosing}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isClosing || (reasonRequired && reason.trim().length < 3)}
          >
            {isClosing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Encerrar e enviar ao caixa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
