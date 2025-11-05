import { MessageSquare, Zap, Bell, BarChart3, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Conversa Natural",
    description: "Pergunte o que quiser em linguagem normal, como se estivesse falando com seu contador.",
  },
  {
    icon: Zap,
    title: "Respostas Instantâneas",
    description: "Análises financeiras completas em segundos, direto no seu WhatsApp.",
  },
  {
    icon: Bell,
    title: "Alertas Proativos",
    description: "Seja avisado antes das contas vencerem e quando houver anomalias no fluxo de caixa.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Automáticos",
    description: "Receba resumos diários, semanais e mensais sem precisar pedir.",
  },
  {
    icon: Clock,
    title: "Disponível 24/7",
    description: "Seu agente financeiro nunca dorme. Tire dúvidas a qualquer hora.",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Criptografia de ponta a ponta e conformidade com LGPD.",
  },
];

const commands = [
  { command: "Qual meu saldo atual?", response: "Você tem R$ 45.230 em caixa hoje" },
  { command: "Quais contas vencem essa semana?", response: "3 contas: Aluguel (R$ 3.500), Luz (R$ 480), Fornecedor XYZ (R$ 2.100)" },
  { command: "Quanto lucrei em outubro?", response: "Lucro líquido: R$ 28.500 (+15% vs setembro)" },
  { command: "Registrar receita de R$ 5.000", response: "✅ Receita registrada! Saldo atualizado para R$ 50.230" },
];

export const SolutionSection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            A Solução: Agente de IA no WhatsApp
          </h2>
          <p className="text-xl text-muted-foreground">
            Tenha um CFO virtual no seu bolso. Respostas instantâneas, análises profundas e controle total das suas finanças.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Exemplos de Comandos</h3>
          <div className="space-y-4">
            {commands.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border rounded-lg p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    👤
                  </div>
                  <p className="font-medium pt-1">{item.command}</p>
                </div>
                <div className="flex items-start gap-3 ml-11">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    🤖
                  </div>
                  <p className="text-muted-foreground pt-1">{item.response}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
