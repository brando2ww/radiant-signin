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

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOrder: (customerName?: string) => void;
  source: "balcao" | "salao";
}

export function NewOrderDialog({
  open,
  onOpenChange,
  onCreateOrder,
  source,
}: NewOrderDialogProps) {
  const [customerName, setCustomerName] = useState("");

  const handleCreate = () => {
    onCreateOrder(customerName.trim() || undefined);
    setCustomerName("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCustomerName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Novo Pedido - {source === "balcao" ? "Balcão" : "Salão"}
          </DialogTitle>
          <DialogDescription>
            {source === "balcao"
              ? "Informe o nome do cliente para retirada (opcional)"
              : "Informe o nome do cliente (opcional)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Nome do Cliente</Label>
            <Input
              id="customer"
              placeholder="Digite o nome do cliente..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Criar Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
