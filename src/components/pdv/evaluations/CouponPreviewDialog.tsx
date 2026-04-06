import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Calendar, User } from "lucide-react";
import { format, parseISO, isBefore } from "date-fns";
import { toast } from "sonner";
import type { PrizeWinWithDetails } from "@/hooks/use-all-prize-wins";

interface CouponPreviewDialogProps {
  coupon: PrizeWinWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStatus(c: PrizeWinWithDetails) {
  if (c.is_redeemed) return { label: "Resgatado", variant: "default" as const };
  if (isBefore(parseISO(c.coupon_expires_at), new Date())) return { label: "Expirado", variant: "destructive" as const };
  return { label: "Ativo", variant: "secondary" as const };
}

export default function CouponPreviewDialog({ coupon, open, onOpenChange }: CouponPreviewDialogProps) {
  if (!coupon) return null;

  const status = getStatus(coupon);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.coupon_code);
    toast.success("Código copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Preview do Cupom
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code display */}
          <div className="bg-muted rounded-lg p-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Código do Cupom</p>
            <p className="text-3xl font-mono font-bold text-primary tracking-widest">{coupon.coupon_code}</p>
            <Button variant="outline" size="sm" onClick={handleCopy} className="mt-2">
              <Copy className="h-4 w-4 mr-1" /> Copiar Código
            </Button>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Prêmio:</span>
              <span className="font-medium">{coupon.prize_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{coupon.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Validade:</span>
              <span className="font-medium">{format(parseISO(coupon.coupon_expires_at), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Campanha:</span>
              <span className="font-medium">{coupon.campaign_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {coupon.redeemed_at && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Resgatado em:</span>
                <span className="font-medium">{format(parseISO(coupon.redeemed_at), "dd/MM/yyyy HH:mm")}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
