import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = {
  monthly: {
    price: "29,90",
    period: "/mês",
    billing: "Cobrado mensalmente após o teste",
  },
  yearly: {
    price: "23,90",
    period: "/mês",
    billing: "R$ 286,80/ano (economia de R$ 72)",
  },
};

const features = [
  "Agente IA no WhatsApp (ilimitado)",
  "Dashboard financeiro completo",
  "Controle de limite MEI",
  "Alertas de DAS e vencimentos",
  "Relatórios automáticos",
  "Agenda integrada",
  "Suporte por WhatsApp",
  "Garantia de 30 dias",
];

interface PricingSectionProps {
  id?: string;
}

export const PricingSection = ({ id }: PricingSectionProps) => {
  const [isYearly, setIsYearly] = useState(true);
  const currentPlan = isYearly ? plans.yearly : plans.monthly;

  return (
    <section id={id} className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comece seu teste grátis de 20 dias
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para você. Sem compromisso, cancele quando quiser.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-muted">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                !isYearly 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                isYearly 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual
              <span className="bg-green-500/10 text-green-600 text-xs px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <Card className="p-8 relative overflow-hidden border-2 border-primary">
            {/* Popular badge */}
            {isYearly && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Mais Popular
              </div>
            )}

            {/* Free trial badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              20 dias grátis
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">{currentPlan.price}</span>
                <span className="text-muted-foreground">{currentPlan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {currentPlan.billing}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button size="lg" className="w-full">
              Começar Teste Grátis
            </Button>

            {/* Trust */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Sem cartão para iniciar • Cancele quando quiser
            </p>
          </Card>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground"
        >
          <span>🔒 Pagamento 100% seguro</span>
          <span>💳 Todos os cartões aceitos</span>
          <span>↩️ Garantia de 30 dias</span>
        </motion.div>
      </div>
    </section>
  );
};
