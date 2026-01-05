import { motion } from "framer-motion";
import { 
  ArrowRight, 
  AlertTriangle, 
  Bell, 
  TrendingDown, 
  BarChart3, 
  FileSpreadsheet, 
  MessageCircle, 
  HelpCircle, 
  LineChart,
  LucideIcon
} from "lucide-react";

interface PainPoint {
  before: {
    icon: LucideIcon;
    title: string;
    text: string;
  };
  after: {
    icon: LucideIcon;
    title: string;
    text: string;
  };
}

const painPoints: PainPoint[] = [
  {
    before: {
      icon: AlertTriangle,
      title: "Multas e atrasos",
      text: "Esqueci de pagar o DAS e levei multa de R$ 50",
    },
    after: {
      icon: Bell,
      title: "Alertas inteligentes",
      text: "Alerta 3 dias antes no seu WhatsApp, impossível esquecer",
    },
  },
  {
    before: {
      icon: TrendingDown,
      title: "Limite desconhecido",
      text: "Não sei se vou estourar o limite do MEI este ano",
    },
    after: {
      icon: BarChart3,
      title: "Controle em tempo real",
      text: "Limite atualizado automaticamente com alertas preventivos",
    },
  },
  {
    before: {
      icon: FileSpreadsheet,
      title: "Planilhas abandonadas",
      text: "Planilha complicada que nunca lembro de atualizar",
    },
    after: {
      icon: MessageCircle,
      title: "Conversa natural",
      text: 'Só manda mensagem: "gastei 50 no mercado" e pronto',
    },
  },
  {
    before: {
      icon: HelpCircle,
      title: "Fim do mês perdido",
      text: "Fim do mês sem saber quanto ganhei ou gastei",
    },
    after: {
      icon: LineChart,
      title: "Relatórios automáticos",
      text: "Relatório automático toda semana direto no WhatsApp",
    },
  },
];

interface PainPointsSectionProps {
  id?: string;
}

export const PainPointsSection = ({ id }: PainPointsSectionProps) => {
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
            Na prática
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Problemas reais, soluções reais
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Veja como a Velara transforma o dia a dia de quem é MEI
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {painPoints.map((item, index) => {
            const BeforeIcon = item.before.icon;
            const AfterIcon = item.after.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-6 items-stretch">
                  {/* Before Card */}
                  <div className="relative p-6 rounded-2xl bg-background border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="absolute -top-3 left-4">
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-destructive/10 text-destructive rounded-full">
                        Antes
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mt-2">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <BeforeIcon className="w-6 h-6 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {item.before.title}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          "{item.before.text}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow - Desktop */}
                  <div className="hidden md:flex items-center justify-center">
                    <motion.div 
                      className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>

                  {/* Arrow - Mobile */}
                  <div className="md:hidden flex justify-center py-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center rotate-90">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* After Card */}
                  <div className="relative p-6 rounded-2xl bg-background border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-1">
                    <div className="absolute -top-3 left-4">
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                        Com a Velara
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mt-2">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <AfterIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {item.after.title}
                        </h4>
                        <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                          {item.after.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/5 border border-primary/10">
            <span className="text-muted-foreground">
              Chega de estresse.
            </span>
            <span className="text-foreground font-semibold">
              Deixa que a Velara cuida.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
