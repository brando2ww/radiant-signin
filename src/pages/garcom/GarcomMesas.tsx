import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GarcomHeader } from "@/components/garcom/GarcomHeader";
import { MesaCard } from "@/components/garcom/MesaCard";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { usePDVOrders } from "@/hooks/use-pdv-orders";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SectorLite {
  id: string;
  name: string;
  color: string;
}

function formatOrderTime(createdAt: string) {
  const start = new Date(createdAt);
  const diffMins = Math.floor((Date.now() - start.getTime()) / 60000);
  if (diffMins < 60) return `${diffMins}min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
}

export default function GarcomMesas() {
  const { tables, isLoading } = usePDVTables();
  const { orders } = usePDVOrders();
  const { visibleUserId } = useEstablishmentId();
  const navigate = useNavigate();

  const { data: sectors } = useQuery({
    queryKey: ["pdv-sectors-garcom", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [] as SectorLite[];
      const { data, error } = await supabase
        .from("pdv_sectors")
        .select("id, name, color")
        .eq("user_id", visibleUserId)
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as SectorLite[];
    },
    enabled: !!visibleUserId,
  });

  const sectorMap = new Map((sectors || []).map((s) => [s.id, s]));

  const getOrderForTable = (tableId: string) =>
    (orders || []).find(
      (o) => o.table_id === tableId && !["finalizado", "cancelado"].includes(o.status)
    );

  return (
    <div>
      <GarcomHeader title="Mesas" />
      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl" />
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">Nenhuma mesa cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tables.map((table) => {
              const sector = table.sector_id ? sectorMap.get(table.sector_id) : null;
              const order = getOrderForTable(table.id);
              return (
                <MesaCard
                  key={table.id}
                  tableNumber={table.table_number}
                  status={table.status}
                  capacity={table.capacity}
                  shape={table.shape}
                  sectorColor={sector?.color}
                  sectorName={sector?.name}
                  orderTotal={order?.total}
                  orderTime={order ? formatOrderTime(order.created_at) : undefined}
                  onClick={() => navigate(`/garcom/mesa/${table.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
