import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

export const PricingSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Preço Especial de Lançamento
          </h2>
          <p className="text-xl text-muted-foreground">
            Para os primeiros 100 na fila de espera
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <Card className="p-8 relative overflow-hidden border-2 border-primary">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Early Bird
            </div>

            <div className="mt-4 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">R$ 29,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through">De R$ 79,90/mês</span>
                <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-sm font-semibold">
                  62% OFF
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Agente de IA no WhatsApp",
                "Dashboard financeiro completo",
                "Alertas de vencimentos",
                "Relatórios automáticos",
                "Análises ilimitadas",
                "Suporte prioritário",
                "30 dias de garantia",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold mb-1">🎁 Bônus Exclusivo</p>
              <p className="text-xs text-muted-foreground">
                Primeiros 100: Ganhe 3 meses de suporte premium
              </p>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            💳 Aceitamos todos os cartões | 🔒 Pagamento 100% seguro
          </p>
        </motion.div>
      </div>
    </section>
  );
};
