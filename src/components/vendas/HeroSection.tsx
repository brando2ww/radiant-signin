import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onCTAClick: () => void;
  waitlistCount?: number;
}

export const HeroSection = ({ onCTAClick, waitlistCount }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:50px_50px]" />
      
      <div className="container relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Lançamento em breve
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
            Controle Financeiro no WhatsApp com IA
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Converse com seu agente financeiro inteligente. Receba análises instantâneas, alertas proativos e tome decisões mais rápidas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={onCTAClick} className="text-lg h-14 px-8">
              <MessageSquare className="mr-2 w-5 h-5" />
              Entrar na Fila de Espera
            </Button>
          </div>

          {waitlistCount && waitlistCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-muted-foreground"
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{waitlistCount} pessoas</span> já estão na fila
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 rounded-xl overflow-hidden shadow-2xl border bg-card"
          >
            <div className="bg-muted p-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="p-8 bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold mb-2">Você</p>
                  <p className="text-muted-foreground">Qual meu saldo atual e quanto tenho disponível para investir?</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold mb-2">Agente IA</p>
                  <p className="text-muted-foreground">
                    Seu saldo atual é R$ 45.230,00. Considerando suas contas a vencer nos próximos 30 dias (R$ 12.500), você tem R$ 32.730 disponíveis para investir com segurança. 💰
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
