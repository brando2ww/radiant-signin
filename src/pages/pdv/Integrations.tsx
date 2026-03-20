import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { IFoodIntegrationCard } from "@/components/pdv/integrations/IFoodIntegrationCard";
import { IFoodIntegrationCard } from "@/components/pdv/integrations/IFoodIntegrationCard";
import { PagSeguroIntegrationCard } from "@/components/pdv/integrations/PagSeguroIntegrationCard";
import { StoneIntegrationCard } from "@/components/pdv/integrations/StoneIntegrationCard";
import { NFAutomaticaIntegrationCard } from "@/components/pdv/integrations/NFAutomaticaIntegrationCard";
import { GoomerIntegrationCard } from "@/components/pdv/integrations/GoomerIntegrationCard";

export default function Integrations() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Integrações"
        description="Conecte seu PDV com plataformas de delivery, maquininhas e ferramentas fiscais"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <IFoodIntegrationCard />
        <PagSeguroIntegrationCard />
        <StoneIntegrationCard />
        <NFAutomaticaIntegrationCard />
        <GoomerIntegrationCard />
      </div>
    </div>
  );
}
