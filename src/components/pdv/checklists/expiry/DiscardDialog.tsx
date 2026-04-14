import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (data: { discard_reason: string; discarded_quantity?: number; notes?: string }) => Promise<void>;
  isPending: boolean;
  productName?: string;
}

const REASONS = [
  { value: "vencido", label: "Vencido" },
  { value: "avariado", label: "Avariado" },
  { value: "contaminado", label: "Contaminado" },
  { value: "outro", label: "Outro" },
];

export function DiscardDialog({ open, onOpenChange, onConfirm, isPending, productName }: Props) {
  const [reason, setReason] = useState("vencido");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    await onConfirm({
      discard_reason: reason,
      discarded_quantity: qty ? parseFloat(qty) : undefined,
      notes: notes || undefined,
    });
    setReason("vencido");
    setQty("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Descartar {productName ? `"${productName}"` : "produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue placeholder="Motivo" /></SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Quantidade descartada" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Textarea placeholder="Observação (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Confirmar descarte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
