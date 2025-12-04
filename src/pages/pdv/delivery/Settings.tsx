import { SettingsTab } from "@/components/delivery/SettingsTab";

export default function DeliverySettings() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações do Delivery</h1>
        <p className="text-muted-foreground">Configure horários, entregas e pagamentos</p>
      </div>
      <SettingsTab />
    </div>
  );
}
