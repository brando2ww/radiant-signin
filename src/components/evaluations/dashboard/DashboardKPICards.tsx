import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Star, Megaphone, Cake, ThumbsUp, Minus, ThumbsDown, Ticket, TicketCheck } from "lucide-react";

interface Props {
  totalResponses: number;
  nps: number;
  avgSatisfaction: number;
  activeCampaigns: number;
  totalCampaigns: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  totalNpsVotes: number;
  birthdayCount: number;
  uniqueCustomers: number;
  totalCoupons: number;
  redeemedCoupons: number;
  onNpsClick?: (category: "promoters" | "neutrals" | "detractors") => void;
}

export default function DashboardKPICards({
  totalResponses, nps, avgSatisfaction, activeCampaigns, totalCampaigns,
  promoters, neutrals, detractors, totalNpsVotes,
  birthdayCount, uniqueCustomers, totalCoupons, redeemedCoupons, onNpsClick,
}: Props) {
  const npsColor = nps >= 50 ? "text-emerald-600" : nps >= 0 ? "text-amber-600" : "text-destructive";
  const pct = (v: number) => totalNpsVotes > 0 ? ((v / totalNpsVotes) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Row 1: Main KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">NPS Global</span>
            </div>
            <p className={`text-3xl font-bold ${npsColor}`}>{nps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Média Geral</span>
            </div>
            <p className="text-3xl font-bold">{avgSatisfaction.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Campanhas Ativas</span>
            </div>
            <p className="text-3xl font-bold">{activeCampaigns} <span className="text-sm font-normal text-muted-foreground">/ {totalCampaigns}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Cake className="h-4 w-4 text-pink-500" />
              <span className="text-xs text-muted-foreground">Aniversariantes do Mês</span>
            </div>
            <p className="text-3xl font-bold">{birthdayCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: NPS Breakdown */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNpsClick?.("promoters")}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Promotores</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{promoters}</p>
            <p className="text-xs text-muted-foreground">{pct(promoters)}% do total</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNpsClick?.("neutrals")}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Minus className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Neutros</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{neutrals}</p>
            <p className="text-xs text-muted-foreground">{pct(neutrals)}% do total</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNpsClick?.("detractors")}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Detratores</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{detractors}</p>
            <p className="text-xs text-muted-foreground">{pct(detractors)}% do total</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Funnel metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total de Respostas</span>
            </div>
            <p className="text-2xl font-bold">{totalResponses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cadastros (únicos)</span>
            </div>
            <p className="text-2xl font-bold">{uniqueCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cupons Gerados</span>
            </div>
            <p className="text-2xl font-bold">{totalCoupons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TicketCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Cupons Utilizados</span>
            </div>
            <p className="text-2xl font-bold">{redeemedCoupons}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
