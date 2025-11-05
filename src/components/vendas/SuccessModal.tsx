import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface SuccessModalProps {
  open: boolean;
  position: number;
  referralCode: string;
}

export const SuccessModal = ({ open, position, referralCode }: SuccessModalProps) => {
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [open]);

  const referralLink = `${window.location.origin}/vendas?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    const text = `Descobri um agente de IA que ajuda a controlar finanças pelo WhatsApp! Entre na fila de espera: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Você está na fila! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">#{position}</p>
            <p className="text-muted-foreground">Sua posição na fila de espera</p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Próximos Passos:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Em breve você receberá um WhatsApp do nosso time</li>
              <li>📧 Fique de olho no seu e-mail para updates</li>
              <li>🎁 Convide amigos e pule posições na fila!</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">Compartilhe e pule na fila:</p>
            <p className="text-xs text-muted-foreground mb-4">
              Cada 3 amigos que entrarem com seu link = suba 10 posições
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <Button className="w-full" onClick={shareWhatsApp}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
