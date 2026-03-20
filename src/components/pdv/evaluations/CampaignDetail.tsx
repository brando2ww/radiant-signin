import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  useEvaluationCampaigns,
  useUpdateCampaign,
} from "@/hooks/use-evaluation-campaigns";
import { CampaignQuestionManager } from "./CampaignQuestionManager";
import { CampaignResponses } from "./CampaignResponses";
import { CampaignReports } from "./CampaignReports";

interface CampaignDetailProps {
  campaignId: string;
}

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const { data: campaigns } = useEvaluationCampaigns();
  const updateCampaign = useUpdateCampaign();
  const campaign = campaigns?.find((c) => c.id === campaignId);

  if (!campaign) return null;

  const publicUrl = `${window.location.origin}/avaliacao/${campaignId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{campaign.name}</h2>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="campaign-active" className="text-sm">Ativa</Label>
          <Switch
            id="campaign-active"
            checked={campaign.is_active}
            onCheckedChange={(checked) =>
              updateCampaign.mutate({ id: campaignId, is_active: checked })
            }
          />
        </div>
      </div>

      {/* QR Code + Link */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" /> Link Público & QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG value={publicUrl} size={160} />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Compartilhe este link ou QR Code com seus clientes para que possam avaliar o estabelecimento.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm truncate">{publicUrl}</code>
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={campaign.is_active ? "default" : "destructive"}>
                  {campaign.is_active ? "Recebendo respostas" : "Campanha desativada"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {campaign.total_responses} respostas recebidas
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="responses">Respostas ({campaign.total_responses})</TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="mt-4">
          <CampaignQuestionManager campaignId={campaignId} />
        </TabsContent>
        <TabsContent value="responses" className="mt-4">
          <CampaignResponses campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
