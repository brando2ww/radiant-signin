import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLookupCoupon, useRedeemCoupon } from "@/hooks/use-all-prize-wins";
import { isBefore, parseISO, format } from "date-fns";
import type { CampaignPrizeWin } from "@/hooks/use-campaign-prizes";

export default function CouponsValidation() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CampaignPrizeWin | null>(null);
  const [error, setError] = useState("");
  const lookup = useLookupCoupon();
  const redeem = useRedeemCoupon();

  const handleSearch = () => {
    if (!code.trim()) return;
    setError("");
    setResult(null);
    lookup.mutate(code, {
      onSuccess: (data) => setResult(data as CampaignPrizeWin),
      onError: (e: Error) => setError(e.message),
    });
  };

  const handleRedeem = () => {
    if (!result) return;
    redeem.mutate(result.coupon_code, {
      onSuccess: (data) => setResult(data as CampaignPrizeWin),
    });
  };

  const getStatus = (w: CampaignPrizeWin) => {
    if (w.is_redeemed) return { label: "Resgatado", icon: CheckCircle, color: "text-blue-500" };
    if (isBefore(parseISO(w.coupon_expires_at), new Date())) return { label: "Expirado", icon: XCircle, color: "text-destructive" };
    return { label: "Ativo", icon: Clock, color: "text-green-500" };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Validação de Cupons</h1>
        <p className="text-sm text-muted-foreground">Verifique e resgate cupons manualmente</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Buscar Cupom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código do cupom (ex: ABC-1234)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono"
            />
            <Button onClick={handleSearch} disabled={lookup.isPending}>
              <Search className="h-4 w-4 mr-2" />
              Validar
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {result && (() => {
            const status = getStatus(result);
            const canRedeem = !result.is_redeemed && !isBefore(parseISO(result.coupon_expires_at), new Date());
            return (
              <div className="p-4 rounded-md border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold">{result.coupon_code}</span>
                  <Badge variant={result.is_redeemed ? "default" : isBefore(parseISO(result.coupon_expires_at), new Date()) ? "destructive" : "secondary"}>
                    <status.icon className={`h-3 w-3 mr-1 ${status.color}`} />
                    {status.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Cliente:</span> {result.customer_name}</div>
                  <div><span className="text-muted-foreground">WhatsApp:</span> {result.customer_whatsapp}</div>
                  <div><span className="text-muted-foreground">Emitido:</span> {format(parseISO(result.created_at), "dd/MM/yyyy HH:mm")}</div>
                  <div><span className="text-muted-foreground">Validade:</span> {format(parseISO(result.coupon_expires_at), "dd/MM/yyyy")}</div>
                  {result.redeemed_at && <div><span className="text-muted-foreground">Resgatado em:</span> {format(parseISO(result.redeemed_at), "dd/MM/yyyy HH:mm")}</div>}
                </div>
                {canRedeem && (
                  <Button onClick={handleRedeem} disabled={redeem.isPending} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resgatar Cupom
                  </Button>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
