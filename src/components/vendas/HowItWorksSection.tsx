import { motion } from "framer-motion";
import { MessageSquare, Sparkles, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Conecte seu WhatsApp",
    description: "Leva menos de 2 minutos. Sem baixar nada, sem complicação.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Converse naturalmente",
    description: '"Gastei R$ 50 no mercado" - só isso! A IA entende e registra.',
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Relaxe e acompanhe",
    description: "Receba alertas, relatórios e insights automáticos no seu ritmo.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

interface HowItWorksSectionProps {
  id?: string;
}

export const HowItWorksSection = ({ id }: HowItWorksSectionProps) => {
  return (
    <section id={id} className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Sem complicação
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Simples como mandar uma mensagem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Você já sabe usar o WhatsApp. Então já sabe usar a Velara.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Step number badge */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <span className={`text-xs font-bold ${step.color} bg-background px-2 py-0.5 rounded-full border`}>
                    PASSO {step.number}
                  </span>
                </div>

                {/* Icon container */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${step.bgColor} flex items-center justify-center transform transition-transform hover:scale-110`}>
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-muted-foreground"
        >
          Pronto pra começar? <span className="text-primary font-medium">Teste grátis por 20 dias →</span>
        </motion.p>
      </div>
    </section>
  );
};
