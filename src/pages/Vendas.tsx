import { motion } from "framer-motion";
import { HeroSection } from "@/components/vendas/HeroSection";
import { SocialProofSection } from "@/components/vendas/SocialProofSection";
import { FeaturesSection } from "@/components/vendas/FeaturesSection";
import { DemoSection } from "@/components/vendas/DemoSection";
import { PricingSection } from "@/components/vendas/PricingSection";
import { TestimonialsSection } from "@/components/vendas/TestimonialsSection";
import { FAQSection } from "@/components/vendas/FAQSection";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowRight } from "lucide-react";

const Vendas = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onCTAClick={scrollToPricing} />
      <SocialProofSection />
      <FeaturesSection />
      <DemoSection onCTAClick={scrollToPricing} />
      <PricingSection id="pricing" />
      <TestimonialsSection />
      <FAQSection />

      {/* Final CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para organizar suas finanças?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Comece seu teste grátis de 20 dias hoje mesmo. 
              Sem cartão, sem compromisso.
            </p>
            <Button size="lg" onClick={scrollToPricing} className="group">
              Começar Agora
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Velara. Todos os direitos reservados.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <Button
        size="icon"
        variant="outline"
        className="fixed bottom-8 right-8 rounded-full shadow-lg"
        onClick={scrollToTop}
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Vendas;
