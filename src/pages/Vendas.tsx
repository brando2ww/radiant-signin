import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { VendasHeader } from "@/components/vendas/VendasHeader";
import { HeroSection } from "@/components/vendas/HeroSection";
import { SocialProofSection } from "@/components/vendas/SocialProofSection";
import { HowItWorksSection } from "@/components/vendas/HowItWorksSection";
import { FeaturesSection } from "@/components/vendas/FeaturesSection";
import { PainPointsSection } from "@/components/vendas/PainPointsSection";
import { PricingSection } from "@/components/vendas/PricingSection";
import { TestimonialsSection } from "@/components/vendas/TestimonialsSection";
import { FAQSection } from "@/components/vendas/FAQSection";
import { VendasFooter } from "@/components/vendas/VendasFooter";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowRight } from "lucide-react";

const Vendas = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <VendasHeader onCTAClick={scrollToPricing} />
      
      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
      
      <HeroSection onCTAClick={scrollToPricing} />
      <SocialProofSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PainPointsSection />
      <PricingSection id="pricing" />
      <TestimonialsSection />
      <FAQSection />

      {/* Final CTA */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para simplificar suas finanças?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a milhares de MEIs que já economizam tempo e dinheiro com a Velara.
            </p>
            <Button size="lg" onClick={scrollToPricing} className="group">
              Começar Meus 20 Dias Grátis
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </motion.div>
        </div>
      </section>

      <VendasFooter />

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-40"
          onClick={scrollToTop}
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default Vendas;
