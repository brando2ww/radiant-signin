import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { MapPin, Hash, TrendingUp, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { DeliveryHeatMap } from "@/components/delivery/heatmap/DeliveryHeatMap";
import { CEPRankingTable } from "@/components/delivery/heatmap/CEPRankingTable";
import { useDeliveryHeatmapData, useGeocodedPoints } from "@/hooks/use-delivery-heatmap";
import { useAuth } from "@/contexts/AuthContext";

export default function HeatMap() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const startDate = dateRange?.from || subDays(new Date(), 30);
  const endDate = dateRange?.to || new Date();

  const { data, isLoading } = useDeliveryHeatmapData(user?.id || "", startDate, endDate);
  const cepData = data?.cepData || [];
  const totalOrders = data?.totalOrders || 0;

  const { points, isLoading: isGeocoding } = useGeocodedPoints(cepData);

  const metrics = useMemo(() => {
    if (cepData.length === 0) return { uniqueCeps: 0, topCep: "—", topNeighborhood: "—", totalRevenue: 0 };
    return {
      uniqueCeps: cepData.length,
      topCep: cepData[0]?.zipCode ? `${cepData[0].zipCode.slice(0, 5)}-${cepData[0].zipCode.slice(5)}` : "—",
      topNeighborhood: cepData[0]?.neighborhood || "—",
      totalRevenue: cepData.reduce((s, c) => s + c.revenue, 0),
    };
  }, [cepData]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ResponsivePageHeader
          title="Mapa de Calor"
          subtitle="Concentração de pedidos por CEP"
        />
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CEPs atendidos</p>
              <p className="text-2xl font-bold">{metrics.uniqueCeps}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CEP mais pedidos</p>
              <p className="text-2xl font-bold font-mono">{metrics.topCep}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bairro mais frequente</p>
              <p className="text-lg font-bold truncate">{metrics.topNeighborhood}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita delivery</p>
              <p className="text-2xl font-bold">
                {metrics.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeliveryHeatMap points={points} isLoading={isLoading || isGeocoding} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Ranking por CEP</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <CEPRankingTable data={cepData} />
        )}
      </div>
    </div>
  );
}
