import { motion } from "framer-motion";
import { ArrowRight, X, Check } from "lucide-react";

const painPoints = [
  {
    before: {
      emoji: "😰",
      text: "Esqueci de pagar o DAS e levei multa de R$ 50",
    },
    after: {
      emoji: "😌",
      text: "Alerta 3 dias antes no seu WhatsApp, impossível esquecer",
    },
  },
  {
    before: {
      emoji: "😓",
      text: "Não sei se vou estourar o limite do MEI este ano",
    },
    after: {
      emoji: "📊",
      text: "Limite atualizado em tempo real com alertas automáticos",
    },
  },
  {
    before: {
      emoji: "😩",
      text: "Planilha complicada que nunca lembro de atualizar",
    },
    after: {
      emoji: "💬",
      text: 'Só manda mensagem: "gastei 50 no mercado" e pronto',
    },
  },
  {
    before: {
      emoji: "😵",
      text: "Fim do mês sem saber quanto ganhei ou gastei",
    },
    after: {
      emoji: "📈",
      text: "Relatório automático toda semana direto no WhatsApp",
    },
  },
];

interface PainPointsSectionProps {
  id?: string;
}

export const PainPointsSection = ({ id }: PainPointsSectionProps) => {
  return (
    <section id={id} className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Na prática
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Problemas reais, soluções reais
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Veja como a Velara transforma o dia a dia de quem é MEI
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {painPoints.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center p-4 md:p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                {/* Before */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <span className="text-2xl">{item.before.emoji}</span>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                      "{item.before.text}"
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Mobile arrow */}
                <div className="md:hidden flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center rotate-90">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>

                {/* After */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <span className="text-2xl">{item.after.emoji}</span>
                    <p className="text-foreground mt-1 text-sm md:text-base font-medium">
                      {item.after.text}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-muted-foreground">
            Chega de estresse.{" "}
            <span className="text-foreground font-semibold">
              Deixa que a Velara cuida.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
