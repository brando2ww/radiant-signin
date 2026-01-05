import { motion } from "framer-motion";
import { 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  LayoutDashboard, 
  FileText, 
  Calendar 
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Agente IA no WhatsApp",
    description: "Tire dúvidas e registre transações por mensagem de texto ou áudio",
  },
  {
    icon: TrendingUp,
    title: "Controle de Limite MEI",
    description: "Acompanhe seu faturamento em tempo real vs R$ 81.000/ano",
  },
  {
    icon: Bell,
    title: "Alertas de DAS",
    description: "Nunca esqueça de pagar seu imposto mensal do MEI",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Financeiro",
    description: "Visualize receitas, despesas e saldo em um só lugar",
  },
  {
    icon: FileText,
    title: "Relatórios Automáticos",
    description: "Receba resumos semanais e mensais no seu WhatsApp",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    description: "Organize compromissos e vencimentos com lembretes",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que seu MEI precisa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Funcionalidades pensadas especificamente para microempreendedores individuais
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
