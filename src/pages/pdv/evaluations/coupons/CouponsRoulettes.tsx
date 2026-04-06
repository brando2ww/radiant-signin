import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CircleDot, Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useEvaluationCampaigns, useUpdateCampaign } from "@/hooks/use-evaluation-campaigns";
import { useCampaignPrizes, useCreatePrize, useUpdatePrize, useDeletePrize, type CampaignPrize } from "@/hooks/use-campaign-prizes";
import { RoulettePreview } from "@/components/pdv/evaluations/RoulettePreview";
import { PrizeDialog } from "@/components/pdv/evaluations/PrizeDialog";

function CampaignRouletteCard({ campaign }: { campaign: any }) {
  const { data: prizes = [] } = useCampaignPrizes(campaign.id);
  const updateCampaign = useUpdateCampaign();
  const createPrize = useCreatePrize();
  const updatePrize = useUpdatePrize();
  const deletePrize = useDeletePrize();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<CampaignPrize | null>(null);

  const wheelPrimary = campaign.wheel_primary_color || "#1a1a2e";
  const wheelSecondary = campaign.wheel_secondary_color || "#722F37";
  const cooldownHours = campaign.roulette_cooldown_hours ?? 0;
  const rouletteEnabled = campaign.roulette_enabled ?? false;

  const totalProbability = prizes.reduce((s: number, p: CampaignPrize) => s + Number(p.probability), 0);

  const handleFieldSave = useCallback((field: string, value: any) => {
    updateCampaign.mutate({ id: campaign.id, [field]: value } as any);
  }, [campaign.id, updateCampaign]);

  const handlePrizeSave = (data: { name: string; color: string; probability: number; max_quantity: number | null; coupon_validity_days: number }) => {
    if (editingPrize) {
      updatePrize.mutate({ id: editingPrize.id, campaign_id: campaign.id, ...data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPrize.mutate({ campaign_id: campaign.id, ...data }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{campaign.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={campaign.is_active ? "secondary" : "destructive"}>
              {campaign.is_active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          {/* Left: Config */}
          <div className="space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Roleta ativa</Label>
              <Switch checked={rouletteEnabled} onCheckedChange={(v) => handleFieldSave("roulette_enabled", v)} />
            </div>

            {/* Colors */}
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cor Primária</Label>
                <input
                  type="color"
                  value={wheelPrimary}
                  onChange={(e) => handleFieldSave("wheel_primary_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cor Secundária</Label>
                <input
                  type="color"
                  value={wheelSecondary}
                  onChange={(e) => handleFieldSave("wheel_secondary_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-input"
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Cooldown (horas)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={cooldownHours}
                  onChange={(e) => handleFieldSave("roulette_cooldown_hours", Number(e.target.value))}
                  className="h-10 w-24"
                />
              </div>
            </div>

            {/* Probability bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Probabilidades</span>
                <span className={totalProbability === 100 ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>
                  {totalProbability}%
                </span>
              </div>
              <Progress value={Math.min(totalProbability, 100)} className="h-2" />
            </div>

            {/* Prizes list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{prizes.length} prêmios</p>
                <Button size="sm" variant="outline" onClick={() => { setEditingPrize(null); setDialogOpen(true); }} className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              {prizes.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm border-b last:border-0 pb-1">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className={`flex-1 truncate ${p.is_active ? "text-foreground" : "text-muted-foreground line-through"}`}>{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.probability}%</span>
                  <span className="text-xs text-muted-foreground">{p.redeemed_count}{p.max_quantity ? `/${p.max_quantity}` : ""}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingPrize(p); setDialogOpen(true); }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deletePrize.mutate({ id: p.id, campaign_id: campaign.id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {prizes.length === 0 && <p className="text-xs text-muted-foreground">Nenhum prêmio cadastrado</p>}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium">Preview</p>
            <RoulettePreview
              prizes={prizes}
              size={180}
              primaryColor={wheelPrimary}
              secondaryColor={wheelSecondary}
            />
          </div>
        </div>
      </CardContent>

      <PrizeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prize={editingPrize}
        onSave={handlePrizeSave}
        saving={createPrize.isPending || updatePrize.isPending}
      />
    </Card>
  );
}

export default function CouponsRoulettes() {
  const { data: campaigns = [], isLoading } = useEvaluationCampaigns();
  const rouletteCampaigns = campaigns.filter((c: any) => c.roulette_enabled !== false);

  if (isLoading) return <div className="p-4 md:p-6"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roletas</h1>
        <p className="text-sm text-muted-foreground">Configure cores, prêmios e cooldown de cada roleta</p>
      </div>

      {rouletteCampaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CircleDot className="h-5 w-5" />
              <p className="text-sm">Nenhuma campanha com roleta encontrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {rouletteCampaigns.map((c) => (
            <CampaignRouletteCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
