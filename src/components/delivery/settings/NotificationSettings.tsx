import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  useDeliverySettings,
  useCreateOrUpdateSettings,
  useToggleStoreOpen,
} from "@/hooks/use-delivery-settings";

export const NotificationSettings = () => {
  const { data: settings } = useDeliverySettings();
  const updateSettings = useCreateOrUpdateSettings();
  const toggleStoreOpen = useToggleStoreOpen();

  const [isOpen, setIsOpen] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);

  useEffect(() => {
    if (settings) {
      setIsOpen(settings.is_open ?? true);
      setAutoAccept(settings.auto_accept_orders ?? false);
      setWhatsappNotifications(settings.whatsapp_notifications ?? true);
    }
  }, [settings]);

  const handleToggleStore = (open: boolean) => {
    setIsOpen(open);
    toggleStoreOpen.mutate(open);
  };

  const handleSave = () => {
    updateSettings.mutate({
      auto_accept_orders: autoAccept,
      whatsapp_notifications: whatsappNotifications,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status da Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isOpen" className="text-base">
                Loja {isOpen ? "Aberta" : "Fechada"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isOpen
                  ? "Clientes podem fazer pedidos"
                  : "Novos pedidos bloqueados"}
              </p>
            </div>
            <Switch
              id="isOpen"
              checked={isOpen}
              onCheckedChange={handleToggleStore}
              disabled={toggleStoreOpen.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoAccept">Aceitar Pedidos Automaticamente</Label>
              <p className="text-sm text-muted-foreground">
                Pedidos vão direto para "Confirmado"
              </p>
            </div>
            <Switch
              id="autoAccept"
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whatsappNotifications">
                Notificações via WhatsApp
              </Label>
              <p className="text-sm text-muted-foreground">
                Enviar atualizações para clientes
              </p>
            </div>
            <Switch
              id="whatsappNotifications"
              checked={whatsappNotifications}
              onCheckedChange={setWhatsappNotifications}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
