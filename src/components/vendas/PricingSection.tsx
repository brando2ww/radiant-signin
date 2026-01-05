import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Mensal",
    price: "29,90",
    period: "/mês",
    billing: "Cobrado mensalmente",
    popular: false,
    features: [
      "Agente IA no WhatsApp (ilimitado)",
      "Dashboard financeiro completo",
      "Controle de limite MEI",
      "Alertas de DAS e vencimentos",
      "Relatórios automáticos",
      "Agenda integrada",
      "Suporte por WhatsApp",
      "Garantia de 30 dias",
    ],
    highlight: null,
  },
  {
    name: "Anual",
    price: "23,90",
    period: "/mês",
    billing: "R$ 286,80/ano",
    popular: true,
    features: [
      "Tudo do plano mensal",
      "Economia de R$ 72 no ano",
      "Equivale a 2 meses grátis!",
      "Suporte prioritário",
      "Acesso antecipado a novidades",
      "Relatórios avançados",
      "Exportação de dados",
      "Garantia de 30 dias",
    ],
    highlight: "Economia de 20%",
  },
];

interface PricingSectionProps {
  id?: string;
}

export const PricingSection = ({ id }: PricingSectionProps) => {
  return (
    <section id={id} className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Investimento
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Comece seu teste grátis de 20 dias
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para você. Sem compromisso, cancele quando quiser.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "p-6 md:p-8 relative overflow-hidden h-full flex flex-col",
                  plan.popular
                    ? "border-2 border-primary shadow-lg shadow-primary/10"
                    : "border-border"
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-bl-lg">
                    <Crown className="w-4 h-4" />
                    Mais Popular
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                      <Sparkles className="w-3 h-3" />
                      {plan.highlight}
                    </span>
                  )}
                </div>

                {/* Free trial badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 w-fit">
                  20 dias grátis
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.billing}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        plan.popular ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Check className={cn(
                          "w-3 h-3",
                          plan.popular ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Começar Teste Grátis
                </Button>

                {/* Trust */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Sem cartão para iniciar • Cancele quando quiser
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">🔒</span> Pagamento 100% seguro
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">💳</span> Todos os cartões aceitos
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">↩️</span> Garantia de 30 dias
          </span>
        </motion.div>
      </div>
    </section>
  );
};
