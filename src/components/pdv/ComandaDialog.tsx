import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ComandaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    customerName?: string;
    personNumber?: number;
    notes?: string;
    orderId?: string | null;
    tableNumber?: number;
  }) => Promise<void>;
  orderId?: string | null;
  isLoading?: boolean;
  tableNumber?: number;
}

export function ComandaDialog({
  open,
  onOpenChange,
  onSubmit,
  orderId,
  isLoading,
  tableNumber,
}: ComandaDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [personNumber, setPersonNumber] = useState<string>("");
  const [tableNum, setTableNum] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      customerName: customerName || undefined,
      personNumber: personNumber ? parseInt(personNumber) : undefined,
      notes: notes || undefined,
      orderId,
      tableNumber: tableNum ? parseInt(tableNum) : undefined,
    });
    setCustomerName("");
    setPersonNumber("");
    setTableNum("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Nova Comanda
            {tableNumber && (
              <span className="text-muted-foreground font-normal ml-2">
                - {formatTableLabel(tableNumber)}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: João, Maria..."
              autoFocus
           />
          </div>

          {!tableNumber && (
            <div className="space-y-2">
              <Label htmlFor="tableNum">Mesa (opcional)</Label>
              <Input
                id="tableNum"
                type="number"
                min="1"
                value={tableNum}
                onChange={(e) => setTableNum(e.target.value)}
                placeholder="Número da mesa..."
              />
            </div>
          )}

          {(orderId || tableNumber) && (
            <div className="space-y-2">
              <Label htmlFor="personNumber">Número de Pessoas</Label>
              <Input
                id="personNumber"
                type="number"
                min="1"
                value={personNumber}
                onChange={(e) => setPersonNumber(e.target.value)}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                Quantidade de pessoas nesta comanda
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações gerais da comanda..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Comanda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
