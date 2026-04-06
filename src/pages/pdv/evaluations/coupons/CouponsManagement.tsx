import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAllPrizeWins, type PrizeWinWithDetails } from "@/hooks/use-all-prize-wins";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { isBefore, parseISO, format } from "date-fns";

function getCouponStatus(w: PrizeWinWithDetails): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (w.is_redeemed) return { label: "Resgatado", variant: "default" };
  if (isBefore(parseISO(w.coupon_expires_at), new Date())) return { label: "Expirado", variant: "destructive" };
  return { label: "Ativo", variant: "secondary" };
}

const PAGE_SIZE = 10;

export default function CouponsManagement() {
  const { data: wins = [], isLoading } = useAllPrizeWins();
  const { data: campaigns = [] } = useEvaluationCampaigns();
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = wins;
    if (campaignFilter !== "all") list = list.filter((w) => w.campaign_id === campaignFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w) => w.coupon_code.toLowerCase().includes(q) || w.customer_name.toLowerCase().includes(q));
    }
    return list;
  }, [wins, search, campaignFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (isLoading) return <div className="p-4 md:p-6"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Cupons</h1>
        <p className="text-sm text-muted-foreground">Lista completa de cupons com status e filtros</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por código ou nome..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={campaignFilter} onValueChange={(v) => { setCampaignFilter(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Campanha" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as campanhas</SelectItem>
            {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />{filtered.length} cupons encontrados</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">WhatsApp</TableHead>
                <TableHead className="hidden md:table-cell">Prêmio</TableHead>
                <TableHead className="hidden lg:table-cell">Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="hidden lg:table-cell">Validade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum cupom encontrado</TableCell></TableRow>
              ) : paged.map((w) => {
                const status = getCouponStatus(w);
                return (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono font-semibold">{w.coupon_code}</TableCell>
                    <TableCell>{w.customer_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{w.customer_whatsapp}</TableCell>
                    <TableCell className="hidden md:table-cell">{w.prize_name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{w.campaign_name}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{format(parseISO(w.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="hidden lg:table-cell">{format(parseISO(w.coupon_expires_at), "dd/MM/yyyy")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
