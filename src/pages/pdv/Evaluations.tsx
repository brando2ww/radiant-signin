import { useState } from "react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { CampaignCard } from "@/components/pdv/evaluations/CampaignCard";
import { CampaignDialog } from "@/components/pdv/evaluations/CampaignDialog";
import { CampaignDetail } from "@/components/pdv/evaluations/CampaignDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function Evaluations() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: campaigns, isLoading } = useEvaluationCampaigns();

  if (selectedCampaignId) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCampaignId(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para campanhas
        </Button>
        <CampaignDetail campaignId={selectedCampaignId} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Avaliações"
        subtitle="Crie campanhas de avaliação e colete feedback dos clientes"
      >
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </ResponsivePageHeader>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => setSelectedCampaignId(campaign.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma campanha criada</p>
          <p className="text-sm mt-1">Crie sua primeira campanha de avaliação para coletar feedback dos clientes.</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Criar Campanha
          </Button>
        </div>
      )}

      <CampaignDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
