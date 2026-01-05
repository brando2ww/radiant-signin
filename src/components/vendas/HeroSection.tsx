import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onCTAClick: () => void;
}

export const HeroSection = ({ onCTAClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              20 dias grátis para testar
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Controle Financeiro do seu{" "}
              <span className="text-primary">MEI</span>{" "}
              pelo WhatsApp
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Converse com seu assistente financeiro inteligente. 
              Controle faturamento, receba alertas de DAS e nunca mais perca um vencimento.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={onCTAClick} className="group">
                Começar Teste Grátis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={onCTAClick}>
                Ver Preços
              </Button>
            </div>

            {/* Trust text */}
            <p className="mt-6 text-sm text-muted-foreground">
              Sem cartão para testar • Cancele quando quiser
            </p>
          </motion.div>

          {/* Hero Visual - Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="bg-[#0b141a] rounded-2xl p-5 max-w-md mx-auto shadow-2xl">
              {/* WhatsApp Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">V</span>
                </div>
                <div>
                  <div className="text-white font-medium">Velara IA</div>
                  <div className="text-white/50 text-sm">online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-end"
                >
                  <div className="bg-[#005c4b] text-white rounded-lg px-4 py-2 max-w-[80%] text-sm">
                    Quanto faturei em dezembro?
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#202c33] text-white rounded-lg px-4 py-2 max-w-[85%] text-sm">
                    Você faturou <strong>R$ 6.750</strong> em dezembro. 
                    Seu limite MEI ainda tem <strong>R$ 74.250</strong> disponíveis este ano.
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex justify-end"
                >
                  <div className="bg-[#005c4b] text-white rounded-lg px-4 py-2 max-w-[80%] text-sm">
                    E quando vence meu DAS?
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#202c33] text-white rounded-lg px-4 py-2 max-w-[85%] text-sm">
                    Seu DAS de dezembro vence <strong>dia 20/01</strong>. 
                    O valor é <strong>R$ 71,60</strong>. Quer que eu te lembre?
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
