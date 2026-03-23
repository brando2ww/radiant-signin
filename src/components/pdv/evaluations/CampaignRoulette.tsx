import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, Gift } from "lucide-react";
import { useCampaignPrizes, useCreatePrize, useUpdatePrize, useDeletePrize, type CampaignPrize } from "@/hooks/use-campaign-prizes";
import { useUpdateCampaign, useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { PrizeDialog } from "./PrizeDialog";
import { RoulettePreview } from "./RoulettePreview";

interface CampaignRouletteProps {
  campaignId: string;
}

export function CampaignRoulette({ campaignId }: CampaignRouletteProps) {
  const { data: prizes = [], isLoading } = useCampaignPrizes(campaignId);
  const { data: campaigns } = useEvaluationCampaigns();
  const campaign = campaigns?.find((c) => c.id === campaignId);
  const rouletteEnabled = (campaign as any)?.roulette_enabled ?? false;

  const updateCampaign = useUpdateCampaign();
  const createPrize = useCreatePrize();
  const updatePrize = useUpdatePrize();
  const deletePrize = useDeletePrize();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<CampaignPrize | null>(null);

  const totalProbability = prizes.reduce((s, p) => s + Number(p.probability), 0);

  const handleToggle = (checked: boolean) => {
    updateCampaign.mutate({ id: campaignId, roulette_enabled: checked } as any);
  };

  const handleSave = (data: { name: string; color: string; probability: number; max_quantity: number | null; coupon_validity_days: number }) => {
    if (editingPrize) {
      updatePrize.mutate({ id: editingPrize.id, campaign_id: campaignId, ...data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPrize.mutate({ campaign_id: campaignId, ...data }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Roleta de Prêmios
              </Label>
              <p className="text-sm text-muted-foreground">
                Quando ativa, o cliente gira a roleta antes de preencher a avaliação
              </p>
            </div>
            <Switch checked={rouletteEnabled} onCheckedChange={handleToggle} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        {/* Prizes list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Prêmios ({prizes.length})</CardTitle>
              <Button size="sm" onClick={() => { setEditingPrize(null); setDialogOpen(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Probability bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Soma das probabilidades</span>
                <span className={totalProbability === 100 ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>
                  {totalProbability}%
                </span>
              </div>
              <Progress value={Math.min(totalProbability, 100)} className="h-2" />
              {totalProbability !== 100 && prizes.length > 0 && (
                <p className="text-xs text-destructive">A soma deve ser exatamente 100%</p>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : prizes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum prêmio cadastrado. Adicione prêmios para configurar a roleta.
              </p>
            ) : (
              <div className="space-y-2">
                {prizes.map((prize) => (
                  <div key={prize.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{prize.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{Number(prize.probability)}%</span>
                        <span>·</span>
                        <span>{prize.max_quantity !== null ? `${prize.redeemed_count}/${prize.max_quantity}` : "Ilimitado"}</span>
                        <span>·</span>
                        <span>{prize.coupon_validity_days}d validade</span>
                      </div>
                    </div>
                    {!prize.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPrize(prize); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePrize.mutate({ id: prize.id, campaign_id: campaignId })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {prizes.length > 0 && (
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-center">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <RoulettePreview prizes={prizes} size={220} />
            </CardContent>
          </Card>
        )}
      </div>

      <PrizeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prize={editingPrize}
        onSave={handleSave}
        saving={createPrize.isPending || updatePrize.isPending}
      />
    </div>
  );
}
