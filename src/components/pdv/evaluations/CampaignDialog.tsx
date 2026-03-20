import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateCampaign } from "@/hooks/use-evaluation-campaigns";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDialog({ open, onOpenChange }: CampaignDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createCampaign = useCreateCampaign();

  const handleSubmit = () => {
    if (!name.trim()) return;
    createCampaign.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Campanha de Avaliação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Nome da campanha *</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pesquisa de Satisfação Janeiro"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-desc">Descrição (opcional)</Label>
            <Textarea
              id="campaign-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo da campanha..."
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createCampaign.isPending}>
            {createCampaign.isPending ? "Criando..." : "Criar Campanha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
