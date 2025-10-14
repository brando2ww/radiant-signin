import { Settings as SettingsIcon, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { GeneralSettingsComponent } from "@/components/settings/GeneralSettings";
import { FinancialSettingsComponent } from "@/components/settings/FinancialSettings";
import { NotificationsSettingsComponent } from "@/components/settings/NotificationsSettings";
import { SecuritySettingsComponent } from "@/components/settings/SecuritySettings";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { AdvancedSettings } from "@/components/settings/AdvancedSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, loading, saving, saveSettings } = useSettings();

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-2 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        </div>
        <p className="text-muted-foreground">Personalize sua experiência no sistema financeiro</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsComponent
            settings={settings.general}
            onSave={(generalSettings) => saveSettings({ general: generalSettings })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialSettingsComponent
            settings={settings.financial}
            onSave={(financialSettings) => saveSettings({ financial: financialSettings })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSettingsComponent
            settings={settings.notifications}
            onSave={(notificationsSettings) => saveSettings({ notifications: notificationsSettings })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsComponent
            settings={settings.security}
            onSave={(securitySettings) => saveSettings({ security: securitySettings })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
