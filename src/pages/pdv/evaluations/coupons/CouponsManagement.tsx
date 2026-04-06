import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Search, ChevronLeft, ChevronRight, Download, Eye, CheckCircle, Trash2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useAllPrizeWins, useRedeemCoupon, type PrizeWinWithDetails } from "@/hooks/use-all-prize-wins";
import { useEvaluationCampaigns } from "@/hooks/use-evaluation-campaigns";
import { isBefore, parseISO, format } from "date-fns";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp-message";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CouponPreviewDialog from "@/components/pdv/evaluations/CouponPreviewDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

type StatusFilter = "all" | "active" | "redeemed" | "expired";

function getCouponStatus(w: PrizeWinWithDetails): { label: string; variant: "default" | "secondary" | "destructive"; key: StatusFilter } {
  if (w.is_redeemed) return { label: "Resgatado", variant: "default", key: "redeemed" };
  if (isBefore(parseISO(w.coupon_expires_at), new Date())) return { label: "Expirado", variant: "destructive", key: "expired" };
  return { label: "Ativo", variant: "secondary", key: "active" };
}

const PAGE_SIZE = 10;

export default function CouponsManagement() {
  const { data: wins = [], isLoading } = useAllPrizeWins();
  const { data: campaigns = [] } = useEvaluationCampaigns();
  const redeemMutation = useRedeemCoupon();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [previewCoupon, setPreviewCoupon] = useState<PrizeWinWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrizeWinWithDetails | null>(null);

  const filtered = useMemo(() => {
    let list = wins;
    if (campaignFilter !== "all") list = list.filter((w) => w.campaign_id === campaignFilter);
    if (statusFilter !== "all") list = list.filter((w) => getCouponStatus(w).key === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w) =>
        w.coupon_code.toLowerCase().includes(q) ||
        w.customer_name.toLowerCase().includes(q) ||
        w.customer_whatsapp.includes(q)
      );
    }
    return list;
  }, [wins, search, campaignFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleRedeem = (code: string) => {
    redeemMutation.mutate(code);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("campaign_prize_wins").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Cupom excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["all-prize-wins"] });
    }
    setDeleteTarget(null);
  };

  const exportCSV = () => {
    const headers = ["Código", "Cliente", "WhatsApp", "Prêmio", "Campanha", "Status", "Data Criação", "Validade", "Data Utilização"];
    const rows = filtered.map((w) => {
      const status = getCouponStatus(w);
      return [
        w.coupon_code,
        w.customer_name,
        w.customer_whatsapp,
        w.prize_name,
        w.campaign_name,
        status.label,
        format(parseISO(w.created_at), "dd/MM/yyyy"),
        format(parseISO(w.coupon_expires_at), "dd/MM/yyyy"),
        w.redeemed_at ? format(parseISO(w.redeemed_at), "dd/MM/yyyy HH:mm") : "-",
      ];
    });

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `premios-emitidos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  if (isLoading) return <div className="p-4 md:p-6"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prêmios Emitidos</h1>
          <p className="text-sm text-muted-foreground">Gestão completa de cupons com ações e filtros</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por código, nome ou telefone..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="redeemed">Resgatado</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={campaignFilter} onValueChange={(v) => { setCampaignFilter(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Campanha" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as campanhas</SelectItem>
            {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {filtered.length} prêmios encontrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Prêmio</TableHead>
                <TableHead className="hidden lg:table-cell">Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Validade</TableHead>
                <TableHead className="hidden lg:table-cell">Utilização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum prêmio encontrado</TableCell></TableRow>
              ) : paged.map((w) => {
                const status = getCouponStatus(w);
                return (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono font-semibold text-xs">{w.coupon_code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{w.customer_name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{w.prize_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{w.prize_name}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{w.campaign_name}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{format(parseISO(w.coupon_expires_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {w.redeemed_at ? format(parseISO(w.redeemed_at), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(`https://wa.me/${formatPhoneForWhatsApp(w.customer_whatsapp)}`, "_blank")}
                          title="WhatsApp"
                        >
                          <WhatsAppIcon size={16} className="text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewCoupon(w)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {status.key === "active" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => handleRedeem(w.coupon_code)}
                            disabled={redeemMutation.isPending}
                            title="Resgatar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTarget(w)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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

      <CouponPreviewDialog coupon={previewCoupon} open={!!previewCoupon} onOpenChange={(o) => !o && setPreviewCoupon(null)} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cupom?</AlertDialogTitle>
            <AlertDialogDescription>
              O cupom <strong>{deleteTarget?.coupon_code}</strong> será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
