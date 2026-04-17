import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePDVKitchen } from "@/hooks/use-pdv-kitchen";
import { useProductionCenters } from "@/hooks/use-production-centers";
import { KitchenItemCard } from "@/components/pdv/KitchenItemCard";
import { KitchenFilters } from "@/components/pdv/KitchenFilters";
import { Skeleton } from "@/components/ui/skeleton";

export default function PDVKitchen() {
  const { items, isLoading, updateItemStatus } = usePDVKitchen();
  const { centers } = useProductionCenters();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const handleUpdateStatus = (itemId: string, status: "preparando" | "pronto" | "entregue") => {
    updateItemStatus({ itemId, status });
  };

  // Filtrar itens
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedStatus) result = result.filter((item) => item.kitchen_status === selectedStatus);
    if (selectedStation) result = result.filter((item) => (item as any).printer_station === selectedStation);
    return result;
  }, [items, selectedStatus, selectedStation]);

  // Contar por status
  const counts = useMemo(() => {
    return {
      total: items.length,
      pendente: items.filter((i) => i.kitchen_status === "pendente").length,
      preparando: items.filter((i) => i.kitchen_status === "preparando").length,
      pronto: items.filter((i) => i.kitchen_status === "pronto").length,
    };
  }, [items]);

  // Agrupar por pedido
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    filteredItems.forEach((item) => {
      const orderId = item.order_id;
      if (!groups[orderId]) {
        groups[orderId] = [];
      }
      groups[orderId].push(item);
    });
    return Object.values(groups);
  }, [filteredItems]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-20" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cozinha</h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie o preparo dos pedidos
        </p>
      </div>

      <KitchenFilters
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        counts={counts}
      />

      {/* Station filter */}
      {centers.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {centers.map((center) => {
            const count = items.filter((i) => (i as any).printer_station === center.slug).length;
            const isSelected = selectedStation === center.slug;
            return (
              <Button
                key={center.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStation(isSelected ? null : center.slug)}
                style={isSelected ? { backgroundColor: center.color, borderColor: center.color } : { borderColor: `${center.color}60` }}
              >
                <span
                  className="h-2 w-2 rounded-full mr-1.5"
                  style={{ backgroundColor: isSelected ? "white" : center.color }}
                />
                {center.name}
                <Badge variant="secondary" className="ml-1.5">{count}</Badge>
              </Button>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <ChefHat className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">
                  {selectedStatus
                    ? "Nenhum item encontrado"
                    : "Nenhum item na cozinha"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStatus
                    ? "Tente outro filtro"
                    : "Novos pedidos aparecerão aqui automaticamente"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupedItems.map((orderItems) =>
            orderItems.map((item) => (
              <KitchenItemCard
                key={item.id}
                item={item}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
