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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CashMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMovement: (type: "sangria" | "reforco", amount: number, description?: string) => void;
  isAdding: boolean;
}

export function CashMovementDialog({
  open,
  onOpenChange,
  onAddMovement,
  isAdding,
}: CashMovementDialogProps) {
  const [type, setType] = useState<"sangria" | "reforco">("sangria");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      return;
    }
    onAddMovement(type, value, description.trim() || undefined);
    setAmount("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movimentação de Caixa</DialogTitle>
          <DialogDescription>
            Registre sangrias ou reforços de caixa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Movimentação</Label>
            <RadioGroup value={type} onValueChange={(v: any) => setType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sangria" id="sangria" />
                <Label htmlFor="sangria" className="font-normal cursor-pointer">
                  Sangria (retirada de dinheiro)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reforco" id="reforco" />
                <Label htmlFor="reforco" className="font-normal cursor-pointer">
                  Reforço (entrada de dinheiro)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Motivo (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o motivo da movimentação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isAdding || !amount || parseFloat(amount) <= 0}
          >
            {isAdding ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
