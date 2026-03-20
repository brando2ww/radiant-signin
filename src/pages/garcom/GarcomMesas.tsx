import { useNavigate } from "react-router-dom";
import { GarcomHeader } from "@/components/garcom/GarcomHeader";
import { MesaCard } from "@/components/garcom/MesaCard";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { Skeleton } from "@/components/ui/skeleton";

export default function GarcomMesas() {
  const { tables, isLoading } = usePDVTables();
  const navigate = useNavigate();

  return (
    <div>
      <GarcomHeader title="Mesas" />
      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-2xl" />
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">Nenhuma mesa cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {tables.map((table) => (
              <MesaCard
                key={table.id}
                tableNumber={table.table_number}
                status={table.status}
                capacity={table.capacity}
                onClick={() => navigate(`/garcom/mesa/${table.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
