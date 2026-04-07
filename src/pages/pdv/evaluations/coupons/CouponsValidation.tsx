import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck, Search, CheckCircle, XCircle, Clock, User, List, Gift,
} from "lucide-react";
import {
  useAllPrizeWins,
  useLookupCoupon,
  useRedeemCoupon,
  useSearchCouponsByCustomer,
  PrizeWinWithDetails,
} from "@/hooks/use-all-prize-wins";
import { isBefore, parseISO, format } from "date-fns";
import type { CampaignPrizeWin } from "@/hooks/use-campaign-prizes";

type StatusFilter = "all" | "active" | "redeemed" | "expired";

const getStatusInfo = (w: { is_redeemed: boolean; coupon_expires_at: string }) => {
  if (w.is_redeemed) return { label: "Resgatado", icon: CheckCircle, color: "text-blue-500", key: "redeemed" as const };
  if (isBefore(parseISO(w.coupon_expires_at), new Date())) return { label: "Expirado", icon: XCircle, color: "text-destructive", key: "expired" as const };
  return { label: "Ativo", icon: Clock, color: "text-green-500", key: "active" as const };
};

const getBadgeVariant = (key: string) => {
  if (key === "redeemed") return "default" as const;
  if (key === "expired") return "destructive" as const;
  return "secondary" as const;
};

export default function CouponsValidation() {
  const [code, setCode] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [result, setResult] = useState<CampaignPrizeWin | null>(null);
  const [customerResults, setCustomerResults] = useState<PrizeWinWithDetails[] | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tableSearch, setTableSearch] = useState("");

  const lookup = useLookupCoupon();
  const redeem = useRedeemCoupon();
  const searchCustomer = useSearchCouponsByCustomer();
  const { data: allWins = [], isLoading: loadingAll } = useAllPrizeWins();

  const handleSearchCode = () => {
    if (!code.trim()) return;
    setError("");
    setResult(null);
    setCustomerResults(null);
    lookup.mutate(code, {
      onSuccess: (data) => setResult(data as CampaignPrizeWin),
      onError: (e: Error) => setError(e.message),
    });
  };

  const handleSearchCustomer = () => {
    if (!customerSearch.trim()) return;
    setError("");
    setResult(null);
    setCustomerResults(null);
    searchCustomer.mutate(customerSearch, {
      onSuccess: (data) => {
        if (!data.length) setError("Nenhum cupom encontrado para esse cliente");
        else setCustomerResults(data);
      },
      onError: (e: Error) => setError(e.message),
    });
  };

  const handleRedeem = (couponCode: string) => {
    redeem.mutate(couponCode, {
      onSuccess: (data) => {
        setResult(data as CampaignPrizeWin);
        setCustomerResults(null);
      },
    });
  };

  const filteredWins = useMemo(() => {
    let list = allWins;
    if (statusFilter !== "all") {
      list = list.filter((w) => getStatusInfo(w).key === statusFilter);
    }
    if (tableSearch.trim()) {
      const t = tableSearch.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.coupon_code.toLowerCase().includes(t) ||
          w.customer_name.toLowerCase().includes(t) ||
          w.customer_whatsapp.includes(t) ||
          w.prize_name.toLowerCase().includes(t)
      );
    }
    return list;
  }, [allWins, statusFilter, tableSearch]);

  const statusCounts = useMemo(() => {
    const counts = { all: allWins.length, active: 0, redeemed: 0, expired: 0 };
    allWins.forEach((w) => {
      const key = getStatusInfo(w).key;
      counts[key]++;
    });
    return counts;
  }, [allWins]);

  const renderCouponDetail = (w: CampaignPrizeWin) => {
    const status = getStatusInfo(w);
    const canRedeem = status.key === "active";
    return (
      <div className="p-4 rounded-md border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-lg font-bold">{w.coupon_code}</span>
          <Badge variant={getBadgeVariant(status.key)}>
            <status.icon className={`h-3 w-3 mr-1 ${status.color}`} />
            {status.label}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Cliente:</span> {w.customer_name}</div>
          <div><span className="text-muted-foreground">WhatsApp:</span> {w.customer_whatsapp}</div>
          <div><span className="text-muted-foreground">Emitido:</span> {format(parseISO(w.created_at), "dd/MM/yyyy HH:mm")}</div>
          <div><span className="text-muted-foreground">Validade:</span> {format(parseISO(w.coupon_expires_at), "dd/MM/yyyy")}</div>
          {w.redeemed_at && <div><span className="text-muted-foreground">Resgatado em:</span> {format(parseISO(w.redeemed_at), "dd/MM/yyyy HH:mm")}</div>}
        </div>
        {canRedeem && (
          <Button onClick={() => handleRedeem(w.coupon_code)} disabled={redeem.isPending} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" /> Resgatar Cupom
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Validação de Cupons</h1>
        <p className="text-sm text-muted-foreground">Verifique e resgate cupons manualmente</p>
      </div>

      {/* Search Section */}
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
              placeholder="Código do cupom (ex: ABC-1234)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearchCode()}
              className="font-mono"
            />
            <Button onClick={handleSearchCode} disabled={lookup.isPending}>
              <Search className="h-4 w-4 mr-2" /> Validar
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nome ou telefone do cliente"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
            />
            <Button variant="outline" onClick={handleSearchCustomer} disabled={searchCustomer.isPending}>
              <User className="h-4 w-4 mr-2" /> Buscar
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {result && renderCouponDetail(result)}

          {customerResults && customerResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">
                {customerResults.length} cupom(ns) encontrado(s)
              </p>
              {customerResults.map((w) => (
                <div key={w.id} className="p-3 rounded-md border bg-card flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{w.coupon_code}</span>
                      <Badge variant={getBadgeVariant(getStatusInfo(w).key)} className="text-xs">
                        {getStatusInfo(w).label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      <Gift className="inline h-3 w-3 mr-1" />
                      {w.prize_name} · {w.campaign_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Validade: {format(parseISO(w.coupon_expires_at), "dd/MM/yyyy")}
                    </p>
                  </div>
                  {getStatusInfo(w).key === "active" && (
                    <Button size="sm" onClick={() => handleRedeem(w.coupon_code)} disabled={redeem.isPending}>
                      Resgatar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Todos os Cupons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "active", "redeemed", "expired"] as StatusFilter[]).map((f) => {
                const labels: Record<StatusFilter, string> = { all: "Todos", active: "Ativos", redeemed: "Resgatados", expired: "Expirados" };
                return (
                  <Button
                    key={f}
                    size="sm"
                    variant={statusFilter === f ? "default" : "outline"}
                    onClick={() => setStatusFilter(f)}
                    className="text-xs"
                  >
                    {labels[f]} ({statusCounts[f]})
                  </Button>
                );
              })}
            </div>
            <Input
              placeholder="Filtrar por código, nome, telefone..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="sm:max-w-xs"
            />
          </div>

          {loadingAll ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Carregando cupons...</p>
          ) : filteredWins.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum cupom encontrado</p>
          ) : (
            <div className="rounded-md border overflow-auto max-h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">WhatsApp</TableHead>
                    <TableHead className="hidden lg:table-cell">Prêmio</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWins.map((w) => {
                    const st = getStatusInfo(w);
                    return (
                      <TableRow key={w.id}>
                        <TableCell className="font-mono text-xs font-medium">{w.coupon_code}</TableCell>
                        <TableCell className="text-sm">{w.customer_name}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{w.customer_whatsapp}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{w.prize_name}</TableCell>
                        <TableCell className="text-xs">{format(parseISO(w.coupon_expires_at), "dd/MM/yy")}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(st.key)} className="text-xs">
                            <st.icon className={`h-3 w-3 mr-1 ${st.color}`} />
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {st.key === "active" && (
                            <Button size="sm" variant="outline" onClick={() => handleRedeem(w.coupon_code)} disabled={redeem.isPending}>
                              Resgatar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
