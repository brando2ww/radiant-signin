import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { IFoodIntegrationCard } from "@/components/pdv/integrations/IFoodIntegrationCard";
import { PagSeguroIntegrationCard } from "@/components/pdv/integrations/PagSeguroIntegrationCard";
import { StoneIntegrationCard } from "@/components/pdv/integrations/StoneIntegrationCard";
import { NFAutomaticaIntegrationCard } from "@/components/pdv/integrations/NFAutomaticaIntegrationCard";
import { GoomerIntegrationCard } from "@/components/pdv/integrations/GoomerIntegrationCard";

const integrationMap: Record<string, { title: string; component: React.ComponentType }> = {
  ifood: { title: "iFood", component: IFoodIntegrationCard },
  pagseguro: { title: "PagSeguro", component: PagSeguroIntegrationCard },
  stone: { title: "Stone", component: StoneIntegrationCard },
  "nf-automatica": { title: "NF Automática", component: NFAutomaticaIntegrationCard },
  goomer: { title: "Goomer", component: GoomerIntegrationCard },
};

export default function IntegrationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const entry = slug ? integrationMap[slug] : null;

  if (!entry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Integração não encontrada.
        <Button variant="link" onClick={() => navigate("/pdv/integracoes")}>
          Voltar
        </Button>
      </div>
    );
  }

  const Component = entry.component;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => navigate("/pdv/integracoes")}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Integrações
      </Button>

      <div className="max-w-2xl">
        <Component />
      </div>
    </div>
  );
}
