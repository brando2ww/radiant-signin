import { useState, useMemo } from "react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowLeft, Search, Megaphone, BarChart3, Users, TrendingUp } from "lucide-react";
import { useEvaluationCampaigns, type CampaignWithStats } from "@/hooks/use-evaluation-campaigns";
import { CampaignCard } from "@/components/pdv/evaluations/CampaignCard";
import { CampaignDialog } from "@/components/pdv/evaluations/CampaignDialog";
import { CampaignDetail } from "@/components/pdv/evaluations/CampaignDetail";

interface CampaignsPageContentProps {
  title?: string;
}

function KpiCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignsPageContent({ title = "Campanhas" }: CampaignsPageContentProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const { data: campaigns, isLoading } = useEvaluationCampaigns();

  // KPIs
  const kpis = useMemo(() => {
    if (!campaigns) return { active: 0, totalResponses: 0, avgNps: null as number | null };
    const active = campaigns.filter(c => c.is_active).length;
    const totalResponses = campaigns.reduce((s, c) => s + c.total_responses, 0);
    const withNps = campaigns.filter(c => c.avg_nps !== null);
    const avgNps = withNps.length > 0 ? withNps.reduce((s, c) => s + c.avg_nps!, 0) / withNps.length : null;
    return { active, totalResponses, avgNps };
  }, [campaigns]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    if (!campaigns) return [];
    let list = [...campaigns];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter === "active") list = list.filter(c => c.is_active);
    if (statusFilter === "inactive") list = list.filter(c => !c.is_active);
    if (sortBy === "recent") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === "responses") list.sort((a, b) => b.total_responses - a.total_responses);
    if (sortBy === "alpha") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [campaigns, search, statusFilter, sortBy]);

  if (selectedCampaignId) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCampaignId(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para campanhas
        </Button>
        <CampaignDetail campaignId={selectedCampaignId} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title={title}
        subtitle="Crie campanhas de avaliação e colete feedback dos clientes"
      >
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </ResponsivePageHeader>

      {/* KPI Cards */}
      {!isLoading && campaigns && campaigns.length > 0 && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <KpiCard icon={BarChart3} label="Campanhas ativas" value={kpis.active} />
          <KpiCard icon={Users} label="Total de respostas" value={kpis.totalResponses} />
          <KpiCard
            icon={TrendingUp}
            label="NPS médio geral"
            value={kpis.avgNps !== null ? kpis.avgNps.toFixed(1) : "—"}
            sub={kpis.avgNps !== null ? (kpis.avgNps >= 9 ? "Excelente" : kpis.avgNps >= 7 ? "Bom" : "Precisa melhorar") : undefined}
          />
        </div>
      )}

      {/* Filters */}
      {!isLoading && campaigns && campaigns.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="responses">Mais respostas</SelectItem>
              <SelectItem value="alpha">Alfabética</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => setSelectedCampaignId(campaign.id)}
            />
          ))}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma campanha encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou a busca.</p>
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">Nenhuma campanha criada</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Crie campanhas personalizadas para coletar avaliações, medir o NPS e entender o que seus clientes pensam sobre seu negócio.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="bg-muted rounded-full px-3 py-1">⭐ Avaliações por estrelas</span>
            <span className="bg-muted rounded-full px-3 py-1">📊 NPS automático</span>
            <span className="bg-muted rounded-full px-3 py-1">📝 Múltipla escolha</span>
            <span className="bg-muted rounded-full px-3 py-1">🎡 Roleta premiada</span>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2 mt-2">
            <Plus className="h-4 w-4" /> Criar Primeira Campanha
          </Button>
        </div>
      )}

      <CampaignDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
