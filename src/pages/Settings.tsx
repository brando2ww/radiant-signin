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
import { AppLayout } from "@/components/layouts/AppLayout";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, loading, saving, saveSettings } = useSettings();

  if (loading) {
    return (
      <AppLayout className="p-4 md:p-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="p-4 md:p-6">
      <div className="container mx-auto max-w-7xl space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar para Dashboard</span>
            <span className="sm:hidden">Voltar</span>
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Personalize sua experiência no sistema financeiro
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
          {/* Tabs com scroll horizontal no mobile */}
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-6 h-auto p-1">
              <TabsTrigger value="general" className="px-3 py-2 text-xs md:text-sm">
                Geral
              </TabsTrigger>
              <TabsTrigger value="financial" className="px-3 py-2 text-xs md:text-sm">
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="notifications" className="px-3 py-2 text-xs md:text-sm">
                Notificações
              </TabsTrigger>
              <TabsTrigger value="security" className="px-3 py-2 text-xs md:text-sm">
                Segurança
              </TabsTrigger>
              <TabsTrigger value="integrations" className="px-3 py-2 text-xs md:text-sm">
                Integrações
              </TabsTrigger>
              <TabsTrigger value="advanced" className="px-3 py-2 text-xs md:text-sm">
                Avançado
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="md:hidden" />
          </ScrollArea>

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
    </AppLayout>
  );
}
