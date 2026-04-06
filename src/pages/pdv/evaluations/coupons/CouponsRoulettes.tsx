import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDot } from "lucide-react";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { useCampaignPrizes } from "@/hooks/use-campaign-prizes";
import { RoulettePreview } from "@/components/pdv/evaluations/RoulettePreview";

function CampaignRouletteCard({ campaign }: { campaign: { id: string; name: string; is_active: boolean; roulette_enabled?: boolean } }) {
  const { data: prizes = [] } = useCampaignPrizes(campaign.id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{campaign.name}</CardTitle>
          <Badge variant={campaign.is_active ? "secondary" : "destructive"}>
            {campaign.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <RoulettePreview prizes={prizes} size={160} />
          <div className="flex-1 space-y-2 w-full">
            <p className="text-sm font-medium text-foreground">{prizes.length} prêmios configurados</p>
            {prizes.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className={p.is_active ? "text-foreground" : "text-muted-foreground line-through"}>{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  <span>{p.probability}%</span>
                  <span>{p.redeemed_count}{p.max_quantity ? `/${p.max_quantity}` : ""}</span>
                </div>
              </div>
            ))}
            {prizes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum prêmio configurado</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CouponsRoulettes() {
  const { data: campaigns = [], isLoading } = useEvaluationCampaigns();

  // Filter campaigns with roulette enabled (or show all if field doesn't exist)
  const rouletteCampaigns = campaigns.filter((c: any) => c.roulette_enabled !== false);

  if (isLoading) return <div className="p-4 md:p-6"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roletas</h1>
        <p className="text-sm text-muted-foreground">Visão consolidada de todas as roletas das campanhas</p>
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
