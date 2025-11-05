import { useState, useEffect } from "react";
import { HeroSection } from "@/components/vendas/HeroSection";
import { ProblemSection } from "@/components/vendas/ProblemSection";
import { SolutionSection } from "@/components/vendas/SolutionSection";
import { PricingSection } from "@/components/vendas/PricingSection";
import { FAQSection } from "@/components/vendas/FAQSection";
import { WaitlistForm } from "@/components/vendas/WaitlistForm";
import { SuccessModal } from "@/components/vendas/SuccessModal";
import { useWaitlist } from "@/hooks/use-waitlist";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const Vendas = () => {
  const [showForm, setShowForm] = useState(false);
  const [successData, setSuccessData] = useState<{ position: number; referralCode: string } | null>(null);
  const [referralCode, setReferralCode] = useState<string>();
  const { waitlistCount } = useWaitlist();

  useEffect(() => {
    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
    }

    // Track page view
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_title: "Vendas - Agente IA WhatsApp",
        page_location: window.location.href,
      });
    }
  }, []);

  const handleCTAClick = () => {
    setShowForm(true);
    const formSection = document.getElementById("waitlist-form");
    formSection?.scrollIntoView({ behavior: "smooth" });

    if (window.gtag) {
      window.gtag("event", "waitlist_form_start");
    }
  };

  const handleSuccess = (position: number, referralCode: string) => {
    setSuccessData({ position, referralCode });
    
    if (window.gtag) {
      window.gtag("event", "waitlist_success", {
        position,
        referral_code: referralCode,
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <HeroSection onCTAClick={handleCTAClick} waitlistCount={waitlistCount} />
      <ProblemSection />
      <SolutionSection />
      <PricingSection />

      {/* Waitlist Form Section */}
      <section id="waitlist-form" className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Entre na Fila de Espera
              </h2>
              <p className="text-xl text-muted-foreground">
                Garanta sua vaga e o desconto especial de lançamento
              </p>
            </div>

            <Card className="p-8">
              <WaitlistForm onSuccess={handleSuccess} referralCode={referralCode} />
            </Card>
          </div>
        </div>
      </section>

      <FAQSection />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Não perca o desconto de 62%
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Vagas limitadas para garantir um lançamento de qualidade e suporte excepcional
          </p>
          <Button size="lg" onClick={handleCTAClick} className="text-lg h-14 px-8">
            Garantir Minha Vaga Agora
          </Button>
          {waitlistCount && waitlistCount > 50 && (
            <p className="mt-4 text-sm text-muted-foreground">
              ⚠️ Mais de {waitlistCount} pessoas já na fila - vagas limitadas!
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Velara. Todos os direitos reservados.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="hover:text-foreground">Termos de Uso</a>
            <a href="#" className="hover:text-foreground">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground">Contato</a>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <Button
        size="icon"
        className="fixed bottom-8 right-8 rounded-full shadow-lg"
        onClick={scrollToTop}
      >
        <ArrowUp className="w-5 h-5" />
      </Button>

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          open={!!successData}
          position={successData.position}
          referralCode={successData.referralCode}
        />
      )}
    </div>
  );
};

export default Vendas;
