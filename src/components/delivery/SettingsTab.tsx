import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Truck, CreditCard, Bell, Smartphone } from "lucide-react";
import { BusinessHoursSettings } from "./settings/BusinessHoursSettings";
import { DeliverySettings } from "./settings/DeliverySettings";
import { PaymentSettings } from "./settings/PaymentSettings";
import { NotificationPreferences } from "./settings/NotificationPreferences";
import { InstallAppButton } from "./InstallAppButton";
import { useState } from "react";

export const SettingsTab = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações do Delivery</h2>
        <p className="text-sm text-muted-foreground">
          Configure horários, entrega, pagamentos e notificações
        </p>
      </div>

      <Tabs defaultValue="hours" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Entrega</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Pagamento</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">App Mobile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="mt-6">
          <BusinessHoursSettings />
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <DeliverySettings />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <PaymentSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationPreferences
            soundEnabled={soundEnabled}
            onSoundToggle={setSoundEnabled}
            emailEnabled={emailEnabled}
            onEmailToggle={setEmailEnabled}
            whatsappEnabled={whatsappEnabled}
            onWhatsappToggle={setWhatsappEnabled}
          />
        </TabsContent>

        <TabsContent value="app" className="mt-6">
          <InstallAppButton />
        </TabsContent>
      </Tabs>
    </div>
  );
};
