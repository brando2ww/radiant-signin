import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateCampaign, type CampaignWithStats } from "@/hooks/use-evaluation-campaigns";

interface EditCampaignDialogProps {
  campaign: Pick<CampaignWithStats, "id" | "name" | "description">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({ campaign, open, onOpenChange }: EditCampaignDialogProps) {
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description ?? "");
  const updateCampaign = useUpdateCampaign();

  useEffect(() => {
    if (open) {
      setName(campaign.name);
      setDescription(campaign.description ?? "");
    }
  }, [open, campaign.name, campaign.description]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    updateCampaign.mutate(
      {
        id: campaign.id,
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-campaign-name">Nome da campanha *</Label>
            <Input
              id="edit-campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pesquisa de Satisfação Janeiro"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-campaign-desc">Descrição (opcional)</Label>
            <Textarea
              id="edit-campaign-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo da campanha..."
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || updateCampaign.isPending}>
            {updateCampaign.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
