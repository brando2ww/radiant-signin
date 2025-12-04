import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencyInput } from "@/components/ui/currency-input";

interface CloseCashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (closingBalance: number, notes?: string) => void;
  isClosing: boolean;
  session: any;
}

export function CloseCashierDialog({
  open,
  onOpenChange,
  onClose,
  isClosing,
  session,
}: CloseCashierDialogProps) {
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");

  const expectedBalance =
    (session?.opening_balance || 0) +
    (session?.total_cash || 0) -
    (session?.total_withdrawals || 0);

  const difference =
    (parseFloat(closingBalance) || 0) - expectedBalance;

  const handleClose = () => {
    const balance = parseFloat(closingBalance) || 0;
    onClose(balance, notes.trim() || undefined);
    setClosingBalance("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
          <DialogDescription>
            Confira os valores e informe o saldo final em dinheiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo Inicial:</span>
                <span className="font-medium">
                  R$ {(session?.opening_balance || 0).toFixed(2)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendas em Dinheiro:</span>
                <span className="font-medium text-success">
                  + R$ {(session?.total_cash || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendas em Cartão:</span>
                <span className="font-medium text-muted-foreground">
                  R$ {(session?.total_card || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendas em PIX:</span>
                <span className="font-medium text-muted-foreground">
                  R$ {(session?.total_pix || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sangrias:</span>
                <span className="font-medium text-destructive">
                  - R$ {(session?.total_withdrawals || 0).toFixed(2)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Saldo Esperado:</span>
                <span>R$ {expectedBalance.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total de Vendas:</span>
                <span className="text-success">
                  R$ {(session?.total_sales || 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="closing">Saldo Final em Dinheiro</Label>
            <CurrencyInput
              id="closing"
              value={closingBalance}
              onChange={setClosingBalance}
              autoFocus
            />
            {closingBalance && (
              <p
                className={`text-sm font-medium ${
                  Math.abs(difference) < 0.01
                    ? "text-success"
                    : difference > 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {Math.abs(difference) < 0.01
                  ? "✓ Saldo confere"
                  : difference > 0
                  ? `Sobra de R$ ${difference.toFixed(2)}`
                  : `Falta de R$ ${Math.abs(difference).toFixed(2)}`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o fechamento do caixa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClosing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleClose}
            disabled={isClosing || !closingBalance}
          >
            {isClosing ? "Fechando..." : "Fechar Caixa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}