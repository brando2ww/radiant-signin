import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CampaignPrize } from "@/hooks/use-campaign-prizes";

interface PrizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize?: CampaignPrize | null;
  onSave: (data: { name: string; color: string; probability: number; max_quantity: number | null; coupon_validity_days: number }) => void;
  saving?: boolean;
}

export function PrizeDialog({ open, onOpenChange, prize, onSave, saving }: PrizeDialogProps) {
  const [name, setName] = useState("");
  const [probability, setProbability] = useState(10);
  const [maxQty, setMaxQty] = useState<string>("");
  const [validityDays, setValidityDays] = useState(7);

  useEffect(() => {
    if (prize) {
      setName(prize.name);
      setProbability(Number(prize.probability));
      setMaxQty(prize.max_quantity !== null ? String(prize.max_quantity) : "");
      setValidityDays(prize.coupon_validity_days);
    } else {
      setName("");
      setProbability(10);
      setMaxQty("");
      setValidityDays(7);
    }
  }, [prize, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color: prize?.color || "#6366f1",
      probability,
      max_quantity: maxQty ? parseInt(maxQty) : null,
      coupon_validity_days: validityDays,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{prize ? "Editar Prêmio" : "Novo Prêmio"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Prêmio *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sobremesa Grátis" />
          </div>

          <div className="space-y-2">
            <Label>Probabilidade (%)</Label>
            <Input type="number" min={1} max={100} value={probability} onChange={(e) => setProbability(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label>Quantidade Máxima (vazio = ilimitado)</Label>
            <Input type="number" min={1} value={maxQty} onChange={(e) => setMaxQty(e.target.value)} placeholder="Ilimitado" />
          </div>

          <div className="space-y-2">
            <Label>Validade do Cupom (dias)</Label>
            <Input type="number" min={1} value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
