import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, ClipboardList, TrendingUp, Users } from "lucide-react";

const crmFeatures = [
  {
    icon: LayoutGrid,
    title: "Pipeline Visual",
    subtitle: "Arraste e organize",
    description: "Visualize todos os seus leads em colunas. Arraste para mover entre estágios: Novo, Primeiro Contato, Negociação, Ganho."
  },
  {
    icon: ClipboardList,
    title: "Atividades e Notas",
    subtitle: "Não perca nenhum detalhe",
    description: "Registre reuniões, ligações e lembretes. Adicione notas importantes e nunca esqueça um follow-up."
  },
  {
    icon: TrendingUp,
    title: "Conversões Inteligentes",
    subtitle: "Feche mais vendas",
    description: "Converta leads em clientes com um clique. Acompanhe valores estimados e taxa de conversão."
  }
];

const pipelineStages = [
  { name: "Novos Leads", color: "bg-blue-500", cards: 3 },
  { name: "1º Contato", color: "bg-amber-500", cards: 2 },
  { name: "Em Discussão", color: "bg-purple-500", cards: 2 },
  { name: "Negociação", color: "bg-orange-500", cards: 1 },
  { name: "Ganhos", color: "bg-green-500", cards: 2 },
  { name: "Perdidos", color: "bg-red-500", cards: 1 }
];

export const CRMSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-4">
            <Users className="w-4 h-4" />
            Gestão de Clientes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Seu Pipeline de Vendas. <span className="text-primary">Organizado.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Acompanhe leads, organize negócios e feche mais vendas com um CRM simples e visual.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {crmFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-primary mb-2">{feature.subtitle}</p>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-border/50 shadow-xl">
            <div className="bg-card p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-muted-foreground">Pipeline de Vendas</span>
              </div>
            </div>
            <div className="p-6 bg-muted/20 overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {pipelineStages.map((stage, stageIndex) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: stageIndex * 0.1 }}
                    className="w-44 flex-shrink-0"
                  >
                    <div className={`${stage.color} rounded-t-lg px-3 py-2`}>
                      <span className="text-white text-sm font-medium">{stage.name}</span>
                      <span className="text-white/80 text-xs ml-2">({stage.cards})</span>
                    </div>
                    <div className="bg-card rounded-b-lg p-2 space-y-2 min-h-[120px] border border-t-0 border-border/50">
                      {Array.from({ length: stage.cards }).map((_, cardIndex) => (
                        <motion.div
                          key={cardIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: stageIndex * 0.1 + cardIndex * 0.05 }}
                          className="bg-muted/50 rounded p-2 border border-border/30"
                        >
                          <div className="h-2 w-3/4 bg-foreground/20 rounded mb-1" />
                          <div className="h-2 w-1/2 bg-foreground/10 rounded" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
