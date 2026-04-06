import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { LoyaltySettings } from "@/components/delivery/loyalty/LoyaltySettings";
import { LoyaltyPrizes } from "@/components/delivery/loyalty/LoyaltyPrizes";
import { CustomerRanking } from "@/components/delivery/loyalty/CustomerRanking";
import { RedemptionHistory } from "@/components/delivery/loyalty/RedemptionHistory";
import { Gift, Settings, Trophy, History } from "lucide-react";

export default function Loyalty() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader title="Programa de Fidelidade" subtitle="Gerencie pontos, prêmios e resgates dos seus clientes" />

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuração</span>
          </TabsTrigger>
          <TabsTrigger value="prizes" className="gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Prêmios</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Ranking</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings"><LoyaltySettings /></TabsContent>
        <TabsContent value="prizes"><LoyaltyPrizes /></TabsContent>
        <TabsContent value="ranking"><CustomerRanking /></TabsContent>
        <TabsContent value="history"><RedemptionHistory /></TabsContent>
      </Tabs>
    </div>
  );
}
