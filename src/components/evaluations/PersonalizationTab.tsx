import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Trash2 } from "lucide-react";
import { useBusinessSettings } from "@/hooks/use-business-settings";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const PersonalizationTab = () => {
  const { user } = useAuth();
  const { settings, loading, saving, saveSettings } = useBusinessSettings();
  
  // Estados locais para o formulário
  const [businessName, setBusinessName] = useState("");
  const [businessSlogan, setBusinessSlogan] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [welcomeMessage, setWelcomeMessage] = useState("Olá! Queremos ouvir você 😊");
  const [thankYouMessage, setThankYouMessage] = useState("Obrigado! Esperamos vê-lo novamente em breve!");

  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = 
    useImageUpload({
      onFileSelect: async (file) => {
        // Upload será feito no handleSave
      }
    });

  const { uploadFile, uploading } = useSupabaseUpload({
    bucket: "business-logos",
    folder: user?.id,
  });

  // Atualizar estados quando settings carregarem
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name);
      setBusinessSlogan(settings.business_slogan || "");
      setBusinessDescription(settings.business_description || "");
      setPrimaryColor(settings.primary_color);
      setSecondaryColor(settings.secondary_color);
      setWelcomeMessage(settings.welcome_message);
      setThankYouMessage(settings.thank_you_message);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!businessName) {
      toast.error("O nome do estabelecimento é obrigatório");
      return;
    }

    let logoUrl = settings?.logo_url;

    // Se há nova imagem, fazer upload
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const uploadedUrl = await uploadFile(file, "logo");
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      }
    }

    await saveSettings({
      business_name: businessName,
      business_slogan: businessSlogan,
      business_description: businessDescription,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      welcome_message: welcomeMessage,
      thank_you_message: thankYouMessage,
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Logo do Estabelecimento */}
      <Card>
        <CardHeader>
          <CardTitle>Logo do Estabelecimento</CardTitle>
          <CardDescription>
            Adicione o logo que aparecerá na página de avaliação pública
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {(previewUrl || settings?.logo_url) && (
              <div className="relative">
                <img
                  src={previewUrl || settings?.logo_url}
                  alt="Logo"
                  className="w-40 h-40 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={handleRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              variant="outline"
              onClick={handleThumbnailClick}
              className="w-full max-w-xs"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              {previewUrl || settings?.logo_url ? "Alterar Logo" : "Adicionar Logo"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Recomendado: 400x400px, formato PNG com fundo transparente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Estabelecimento */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Estabelecimento</CardTitle>
          <CardDescription>
            Dados que aparecerão na página pública de avaliação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Nome do Estabelecimento *</Label>
            <Input
              id="business-name"
              placeholder="Ex: Restaurante Sabor da Casa"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-slogan">Slogan</Label>
            <Input
              id="business-slogan"
              placeholder="Ex: A melhor comida caseira da cidade"
              value={businessSlogan}
              onChange={(e) => setBusinessSlogan(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-description">Descrição</Label>
            <Textarea
              id="business-description"
              placeholder="Conte um pouco sobre seu estabelecimento..."
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Identidade Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>
            Personalize as cores da página de avaliação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg" style={{ 
            background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)`,
            borderColor: primaryColor 
          }}>
            <p className="text-center text-sm font-medium">Preview do gradiente</p>
          </div>
        </CardContent>
      </Card>

      {/* Mensagens Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens Personalizadas</CardTitle>
          <CardDescription>
            Customize as mensagens que seus clientes verão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
            <Textarea
              id="welcome-message"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thank-you-message">Mensagem de Agradecimento</Label>
            <Textarea
              id="thank-you-message"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          size="lg"
        >
          {saving || uploading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};
