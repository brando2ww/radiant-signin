import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dices } from "lucide-react";
import { useAllPrizeWins } from "@/hooks/use-all-prize-wins";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { format, parseISO } from "date-fns";

export default function CouponsDraw() {
  const { data: wins = [], isLoading } = useAllPrizeWins();
  const { data: campaigns = [] } = useEvaluationCampaigns();
  const [campaignFilter, setCampaignFilter] = useState("all");

  const filtered = useMemo(() => {
    if (campaignFilter === "all") return wins;
    return wins.filter((w) => w.campaign_id === campaignFilter);
  }, [wins, campaignFilter]);

  if (isLoading) return <div className="p-4 md:p-6"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sorteio</h1>
        <p className="text-sm text-muted-foreground">Histórico de sorteios realizados pela roleta</p>
      </div>

      <div className="flex">
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Campanha" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as campanhas</SelectItem>
            {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Dices className="h-5 w-5 text-primary" />
            {filtered.length} sorteios realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">WhatsApp</TableHead>
                <TableHead>Prêmio</TableHead>
                <TableHead className="hidden md:table-cell">Campanha</TableHead>
                <TableHead className="hidden md:table-cell">Cupom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum sorteio encontrado</TableCell></TableRow>
              ) : filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{format(parseISO(w.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>{w.customer_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{w.customer_whatsapp}</TableCell>
                  <TableCell>{w.prize_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{w.campaign_name}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono">{w.coupon_code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
