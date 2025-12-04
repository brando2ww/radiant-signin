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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OpenCashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: (openingBalance: number) => void;
  isOpening: boolean;
}

export function OpenCashierDialog({
  open,
  onOpenChange,
  onOpen,
  isOpening,
}: OpenCashierDialogProps) {
  const [openingBalance, setOpeningBalance] = useState("");

  const handleOpen = () => {
    const balance = parseFloat(openingBalance) || 0;
    onOpen(balance);
    setOpeningBalance("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caixa</DialogTitle>
          <DialogDescription>
            Informe o saldo inicial em dinheiro do caixa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Saldo Inicial (R$)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              placeholder="R$ 0,00"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isOpening) {
                  handleOpen();
                }
              }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Este valor representa o troco inicial disponível no caixa
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isOpening}
          >
            Cancelar
          </Button>
          <Button onClick={handleOpen} disabled={isOpening}>
            {isOpening ? "Abrindo..." : "Abrir Caixa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
