import { Factory } from "lucide-react";
import { ProductionCentersTab } from "@/components/pdv/settings/ProductionCentersTab";

export default function ProductionCenters() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Factory className="h-8 w-8" />
          Centros de Produção
        </h1>
        <p className="text-muted-foreground">
          Cadastre as bancadas/estações de preparo do seu estabelecimento e direcione cada produto para a impressora correta
        </p>
      </div>

      <ProductionCentersTab />
    </div>
  );
}
