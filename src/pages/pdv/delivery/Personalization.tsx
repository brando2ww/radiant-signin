import { PersonalizationTab } from "@/components/delivery/PersonalizationTab";

export default function DeliveryPersonalization() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Personalização do Cardápio</h1>
        <p className="text-muted-foreground">
          Configure a aparência do seu cardápio público
        </p>
      </div>
      <PersonalizationTab />
    </div>
  );
}
