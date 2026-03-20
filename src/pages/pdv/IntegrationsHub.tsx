import { useNavigate } from "react-router-dom";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import ifoodLogo from "@/assets/integrations/ifood.png";
import pagseguroLogo from "@/assets/integrations/pagseguro.png";
import stoneLogo from "@/assets/integrations/stone.png";
import goomerLogo from "@/assets/integrations/goomer.png";
import nfeLogo from "@/assets/integrations/nfe.png";
import getnetLogo from "@/assets/integrations/getnet.png";

const integrations = [
  {
    slug: "ifood",
    name: "iFood",
    description: "Receba pedidos do iFood diretamente no seu PDV com sincronização automática de cardápio e status.",
    logo: ifoodLogo,
    category: "Delivery",
    categoryColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    slug: "pagseguro",
    name: "PagSeguro",
    description: "Conecte sua maquininha PagSeguro para receber pagamentos em cartão de débito e crédito.",
    logo: pagseguroLogo,
    category: "Maquininha",
    categoryColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    slug: "stone",
    name: "Stone",
    description: "Integração com terminais Stone para pagamentos por cartão com split e antecipação.",
    logo: stoneLogo,
    category: "Maquininha",
    categoryColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    slug: "getnet",
    name: "Getnet",
    description: "Conecte sua maquininha Getnet (Santander) com POS integrado via Cloud, USB ou HTTP.",
    logo: getnetLogo,
    category: "Maquininha",
    categoryColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    slug: "nf-automatica",
    name: "NF Automática",
    description: "Emita notas fiscais automaticamente ao finalizar vendas, com certificado digital A1.",
    logo: nfeLogo,
    category: "Fiscal",
    categoryColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    slug: "goomer",
    name: "Goomer",
    description: "Cardápio digital interativo com QR Code por mesa e pedidos via tablet integrados ao PDV.",
    logo: goomerLogo,
    category: "Cardápio Digital",
    categoryColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
];

export default function IntegrationsHub() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Integrações"
        description="Conecte seu PDV com plataformas de delivery, maquininhas e ferramentas fiscais"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.slug}
              className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Badge
                variant="secondary"
                className={`absolute top-4 right-4 text-[11px] font-medium ${item.categoryColor}`}
              >
                {item.category}
              </Badge>

              <div className="flex items-center gap-3 mb-4">
                {item.logo ? (
                  <div className="h-12 w-12 shrink-0 rounded-lg border bg-white p-1.5 flex items-center justify-center">
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : Icon ? (
                  <div className="h-12 w-12 shrink-0 rounded-lg border bg-muted flex items-center justify-center">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                ) : null}
                <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-5 flex-1">
                {item.description}
              </p>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate(`/pdv/integracoes/${item.slug}`)}
              >
                Acessar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
