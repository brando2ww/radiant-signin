import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users } from "lucide-react";
import type { CampaignWithStats } from "@/hooks/use-evaluation-campaigns";

interface CampaignCardProps {
  campaign: CampaignWithStats;
  onClick: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{campaign.name}</CardTitle>
          <Badge variant={campaign.is_active ? "default" : "secondary"}>
            {campaign.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {campaign.total_responses} respostas
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
