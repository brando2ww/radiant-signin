import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  TrendingUp,
  Bell,
  LayoutDashboard,
  FileText,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Conversa no WhatsApp",
    subtitle: "Como falar com um amigo",
    description:
      "Registre ganhos, tire dúvidas e peça relatórios. Tudo pelo app que você já usa todo dia, sem complicação.",
  },
  {
    icon: TrendingUp,
    title: "Controle do Limite MEI",
    subtitle: "Durma tranquilo",
    description:
      "Acompanhe seu faturamento em tempo real e receba alertas antes de chegar perto dos R$ 81.000. Sem surpresas.",
  },
  {
    icon: Bell,
    title: "Alertas de DAS",
    subtitle: "Nunca mais esqueça",
    description:
      "Receba lembretes automáticos antes do vencimento. A gente te avisa, você só precisa pagar.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Completo",
    subtitle: "Tudo num só lugar",
    description:
      "Veja suas finanças de forma visual e fácil de entender. Gráficos, números e insights que fazem sentido.",
  },
  {
    icon: FileText,
    title: "Relatórios Automáticos",
    subtitle: "Sem trabalho manual",
    description:
      "Receba resumos semanais e mensais direto no WhatsApp. Perfeito para acompanhar sua evolução.",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    subtitle: "Organize sua vida",
    description:
      "Vencimentos, compromissos e lembretes importantes. Tudo organizado para você não perder nada.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa, nada que não precisa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Funcionalidades pensadas especialmente para quem é MEI e quer 
            simplificar a vida financeira sem complicação
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
            >
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{feature.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
