import { useState } from "react";
import { SessionNavBar } from "@/components/ui/sidebar";
import { PricingToggle } from "@/components/plans/PricingToggle";
import { PricingCard } from "@/components/plans/PricingCard";
import { ComparisonTable } from "@/components/plans/ComparisonTable";
import { PlansFAQ } from "@/components/plans/PlansFAQ";
import { PLANS } from "@/data/plans";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Plans() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const handleSelectPlan = (planId: string) => {
    const plan = PLANS[planId];
    if (planId === "free") {
      toast.success(`Você já está usando o plano ${plan.name}!`);
    } else if (planId === "enterprise") {
      toast.info("Em breve você poderá entrar em contato conosco para o plano Enterprise!");
    } else {
      toast.info(`Em breve você poderá assinar o plano ${plan.name}!`);
    }
  };
  return <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-8 ml-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-6 text-center animate-fade-in">
            

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Escolha o Plano Ideal para Seu MEI
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gerencie suas finanças com simplicidade e eficiência. Comece grátis e faça upgrade quando precisar.
              </p>
            </div>

            <div className="pt-4">
              <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(PLANS).map((plan, index) => <PricingCard key={plan.id} plan={plan} isYearly={isYearly} onSelect={handleSelectPlan} index={index} />)}
          </div>

          {/* FAQ Section */}
          <div className="animate-fade-in" style={{
          animationDelay: "400ms"
        }}>
            <PlansFAQ />
          </div>

          {/* Comparison Table */}
          <div className="animate-fade-in" style={{
          animationDelay: "500ms"
        }}>
            <ComparisonTable />
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 py-12 animate-fade-in" style={{
          animationDelay: "600ms"
        }}>
            <h2 className="text-3xl font-bold">Ainda tem dúvidas?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano para seu negócio.
            </p>
            <Button size="lg" variant="outline" className="mt-4">
              Fale Conosco
            </Button>
          </div>
        </div>
      </main>
    </div>;
}