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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead } from "@/hooks/use-crm-leads";
import { useMarkLeadAsLost } from "@/hooks/use-convert-lead";
import { X } from "lucide-react";

interface LostLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const lossReasons = [
  { value: "price", label: "Preço muito alto" },
  { value: "competitor", label: "Escolheu concorrente" },
  { value: "timing", label: "Momento inadequado" },
  { value: "budget", label: "Sem orçamento" },
  { value: "no_response", label: "Sem resposta" },
  { value: "changed_mind", label: "Desistiu do projeto" },
  { value: "other", label: "Outro motivo" },
];

export function LostLeadDialog({ open, onOpenChange, lead }: LostLeadDialogProps) {
  const markAsLost = useMarkLeadAsLost();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = async () => {
    if (!lead) return;

    const reason = selectedReason === "other" 
      ? customReason 
      : lossReasons.find(r => r.value === selectedReason)?.label || "";

    await markAsLost.mutateAsync({
      leadId: lead.id,
      reason,
    });

    setSelectedReason("");
    setCustomReason("");
    onOpenChange(false);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-destructive" />
            Marcar como Perdido
          </DialogTitle>
          <DialogDescription>
            Registre o motivo da perda para análise futura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Lead Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">{lead.name}</p>
            <p className="text-sm text-muted-foreground">{lead.project_title}</p>
          </div>

          {/* Loss Reason */}
          <div className="space-y-2">
            <Label>Motivo da Perda</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {lossReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label>Descreva o motivo</Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explique o motivo da perda..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={markAsLost.isPending}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Confirmar Perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
