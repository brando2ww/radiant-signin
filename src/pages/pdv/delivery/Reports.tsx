import { ReportsTab } from "@/components/delivery/ReportsTab";

export default function DeliveryReports() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatórios do Delivery</h1>
        <p className="text-muted-foreground">Analise o desempenho do seu delivery</p>
      </div>
      <ReportsTab />
    </div>
  );
}
