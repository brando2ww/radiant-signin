import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Type, Image as ImageIcon, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  useEvaluationCampaigns,
  useUpdateCampaign,
} from "@/hooks/use-evaluation-campaigns";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  campaignId: string;
}

export function CampaignPersonalization({ campaignId }: Props) {
  const { data: campaigns } = useEvaluationCampaigns();
  const updateCampaign = useUpdateCampaign();
  const { user } = useAuth();
  const { uploadFile, uploading } = useSupabaseUpload({ bucket: "business-logos", folder: user?.id });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const campaign = campaigns?.find((c) => c.id === campaignId) as any;

  const [logoUrl, setLogoUrl] = useState("");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");

  useEffect(() => {
    if (campaign) {
      setLogoUrl(campaign.logo_url || "");
      setBgColor(campaign.background_color || "#f8fafc");
      setWelcomeMessage(campaign.welcome_message || "");
      setThankYouMessage(campaign.thank_you_message || "");
    }
  }, [campaign]);

  const handleLogoUpload = async (file: File) => {
    const url = await uploadFile(file, `campaign-${campaignId}`);
    if (url) setLogoUrl(url);
  };

  const handleSave = () => {
    updateCampaign.mutate({
      id: campaignId,
      logo_url: logoUrl || null,
      background_color: bgColor,
      welcome_message: welcomeMessage || null,
      thank_you_message: thankYouMessage || null,
    } as any);
  };

  if (!campaign) return null;

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Logotipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            O logo aparecerá no topo da pesquisa pública.
          </p>
          {logoUrl && (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg border" />
              <Button variant="outline" size="sm" onClick={() => setLogoUrl("")}>
                Remover
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Enviando..." : "Enviar logotipo"}
          </Button>
        </CardContent>
      </Card>

      {/* Background Color */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" /> Cor de Fundo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Define a cor de fundo da página da pesquisa.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer"
            />
            <Input
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              placeholder="#f8fafc"
              className="max-w-[140px] font-mono"
            />
            <div
              className="w-24 h-12 rounded-lg border"
              style={{ backgroundColor: bgColor }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" /> Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mensagem de boas-vindas</Label>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Ex: Olá! Gostaríamos de ouvir sua opinião sobre nosso restaurante."
              maxLength={300}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Exibida na primeira tela da pesquisa.</p>
          </div>
          <div className="space-y-2">
            <Label>Mensagem de agradecimento</Label>
            <Textarea
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              placeholder="Ex: Obrigado por avaliar! Sua opinião é muito importante para nós."
              maxLength={300}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Exibida após o envio da avaliação.</p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={updateCampaign.isPending}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {updateCampaign.isPending ? "Salvando..." : "Salvar Personalização"}
      </Button>
    </div>
  );
}
