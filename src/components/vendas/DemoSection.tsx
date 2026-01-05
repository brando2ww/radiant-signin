import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const chatMessages = [
  { type: "user", text: "Quanto faturei esse mês?" },
  { type: "agent", text: "Você faturou R$ 6.750 em janeiro. Seu limite MEI ainda tem R$ 74.250 disponíveis (91,7%)." },
  { type: "user", text: "Quando vence meu DAS?" },
  { type: "agent", text: "Seu DAS de janeiro vence dia 20/02. O valor é R$ 71,60. Quer que eu te lembre 3 dias antes?" },
  { type: "user", text: "Sim, pode lembrar" },
  { type: "agent", text: "Pronto! ✅ Vou te avisar dia 17/02 sobre o vencimento do DAS." },
];

interface DemoSectionProps {
  onCTAClick: () => void;
}

export const DemoSection = ({ onCTAClick }: DemoSectionProps) => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Converse naturalmente com seu assistente
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Pergunte sobre seu faturamento, agende lembretes, registre transações. 
              Tudo pelo WhatsApp, como se fosse uma conversa normal.
            </p>
            
            <ul className="space-y-3 mb-8">
              {[
                "Entende texto e áudio",
                "Responde em segundos",
                "Disponível 24/7",
                "Aprende com você",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Button size="lg" onClick={onCTAClick}>
              Testar por 20 dias grátis
            </Button>
          </motion.div>

          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-[#0b141a] rounded-2xl p-4 max-w-sm mx-auto shadow-2xl">
              {/* WhatsApp Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">V</span>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Velara IA</div>
                  <div className="text-white/50 text-xs">online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3 max-h-[350px] overflow-hidden">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.type === 'user'
                          ? 'bg-[#005c4b] text-white'
                          : 'bg-[#202c33] text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
