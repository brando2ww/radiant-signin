import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onCTAClick: () => void;
}

export const HeroSection = ({ onCTAClick }: HeroSectionProps) => {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="w-3 h-3 mr-2" />
              20 dias grátis para você testar
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Seu parceiro financeiro{" "}
              <span className="text-primary">no WhatsApp</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-xl mx-auto lg:mx-0">
              Chega de planilhas e preocupações. Tenha um assistente que entende suas dúvidas 
              e cuida das suas finanças enquanto você foca no que importa: <strong>seu negócio</strong>.
            </p>

            <p className="text-sm text-muted-foreground/80 mb-8 italic">
              Criado por empreendedores, para empreendedores.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={onCTAClick} className="group">
                Começar Meus 20 Dias Grátis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={onCTAClick}>
                Ver Preços
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                ✓ Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1">
                ✓ Cancele quando quiser
              </span>
            </div>
          </motion.div>

          {/* Right Content - WhatsApp Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6 md:p-8">
              {/* Phone Frame */}
              <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border">
                {/* WhatsApp Header */}
                <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Velara IA</p>
                    <p className="text-xs opacity-80">online agora</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 bg-muted/30 min-h-[280px]">
                  {/* User Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end"
                  >
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Oi! Quanto faturei esse mês?</p>
                    </div>
                  </motion.div>

                  {/* Bot Response */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-start"
                  >
                    <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                      <p className="text-sm mb-2">
                        Olá! 👋 Você faturou <strong>R$ 6.750</strong> em dezembro.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Seu limite MEI ainda tem <strong>R$ 74.250</strong> disponíveis até o fim do ano. Tá indo super bem! 🚀
                      </p>
                    </div>
                  </motion.div>

                  {/* User Follow-up */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex justify-end"
                  >
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                      <p className="text-sm">E o DAS, quando vence?</p>
                    </div>
                  </motion.div>

                  {/* Bot Final Response */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex justify-start"
                  >
                    <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                      <p className="text-sm">
                        Vence dia <strong>20/01</strong>. Quer que eu te lembre 3 dias antes? 📅
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 }}
              className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
            >
              Resposta em segundos
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
