import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PDVTableStatus } from "@/hooks/use-pdv-tables";

interface MesaCardProps {
  tableNumber: string;
  status: PDVTableStatus;
  capacity: number;
  shape?: string;
  sectorColor?: string;
  sectorName?: string;
  orderTotal?: number;
  orderTime?: string;
  comandaCount?: number;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  PDVTableStatus,
  {
    tableColor: string;
    chairColor: string;
    textColor: string;
    dotColor: string;
  }
> = {
  livre: {
    tableColor: "bg-muted",
    chairColor: "bg-muted-foreground/20",
    textColor: "text-muted-foreground",
    dotColor: "bg-green-500",
  },
  ocupada: {
    tableColor: "bg-orange-400",
    chairColor: "bg-orange-500",
    textColor: "text-white",
    dotColor: "bg-orange-500",
  },
  aguardando_pedido: {
    tableColor: "bg-amber-300",
    chairColor: "bg-amber-400",
    textColor: "text-amber-900",
    dotColor: "bg-amber-500",
  },
  aguardando_cozinha: {
    tableColor: "bg-orange-300",
    chairColor: "bg-orange-400",
    textColor: "text-orange-900",
    dotColor: "bg-orange-400",
  },
  pediu_conta: {
    tableColor: "bg-red-500",
    chairColor: "bg-red-600",
    textColor: "text-white",
    dotColor: "bg-red-500",
  },
  pendente_pagamento: {
    tableColor: "bg-purple-400",
    chairColor: "bg-purple-500",
    textColor: "text-white",
    dotColor: "bg-purple-500",
  },
};

function getChairLayout(capacity: number, shape: string = "square") {
  if (shape === "round") {
    const perSide = Math.ceil(capacity / 4);
    return {
      top: Math.min(perSide, capacity),
      right: Math.min(perSide, Math.max(0, capacity - perSide)),
      bottom: Math.min(perSide, Math.max(0, capacity - perSide * 2)),
      left: Math.max(0, capacity - perSide * 3),
    };
  }
  if (shape === "rectangle") {
    const halfCapacity = Math.ceil(capacity / 2);
    return { top: halfCapacity, right: 0, bottom: capacity - halfCapacity, left: 0 };
  }
  if (capacity <= 2) return { top: 1, right: 0, bottom: 1, left: 0 };
  if (capacity <= 4) return { top: 1, right: 1, bottom: 1, left: 1 };
  if (capacity <= 6) return { top: 2, right: 1, bottom: 2, left: 1 };
  return { top: 2, right: 2, bottom: 2, left: 2 };
}

export function MesaCard({
  tableNumber,
  status,
  capacity,
  shape = "square",
  sectorColor,
  sectorName,
  orderTotal,
  orderTime,
  comandaCount,
  onClick,
}: MesaCardProps) {
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.livre;
  const chairLayout = getChairLayout(capacity, shape);
  const isOccupied = status !== "livre";

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all p-3 bg-card shadow-sm relative active:scale-[0.98]"
      style={{
        borderWidth: sectorColor ? "2px" : "0",
        borderColor: sectorColor || "transparent",
        borderStyle: "solid",
      }}
    >
      {sectorColor && sectorName && (
        <div
          className="absolute -top-2 left-3 px-2 py-0.5 rounded text-[9px] font-semibold text-white shadow-sm z-10 uppercase tracking-wide"
          style={{ backgroundColor: sectorColor }}
        >
          {sectorName}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="w-full flex justify-end">
          <div className={cn("w-2.5 h-2.5 rounded-full", statusConfig.dotColor)} />
        </div>

        <div className="relative flex flex-col items-center gap-1">
          {/* Top chairs */}
          <div className="flex gap-1 justify-center">
            {Array.from({ length: chairLayout.top }).map((_, i) => (
              <div key={`t-${i}`} className={cn("w-6 h-3 rounded-sm", statusConfig.chairColor)} />
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* Left chairs */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: chairLayout.left }).map((_, i) => (
                <div key={`l-${i}`} className={cn("w-3 h-6 rounded-sm", statusConfig.chairColor)} />
              ))}
            </div>

            {/* Table */}
            <div
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                shape === "round" ? "rounded-full" : "rounded-lg",
                statusConfig.tableColor,
                capacity <= 4 ? "w-20 h-20" : "w-24 h-20"
              )}
            >
              <span className={cn("text-lg font-bold", statusConfig.textColor)}>
                M{tableNumber}
              </span>
              {isOccupied && orderTotal !== undefined && orderTotal > 0 && (
                <span className={cn("text-xs font-medium", statusConfig.textColor)}>
                  R$ {orderTotal.toFixed(0)}
                </span>
              )}
              {isOccupied && orderTime && (
                <span className={cn("text-[10px] opacity-80", statusConfig.textColor)}>
                  {orderTime}
                </span>
              )}
              {isOccupied && comandaCount !== undefined && comandaCount > 0 && (
                <span className={cn("text-[9px] opacity-70", statusConfig.textColor)}>
                  {comandaCount} cmd
                </span>
              )}
            </div>

            {/* Right chairs */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: chairLayout.right }).map((_, i) => (
                <div key={`r-${i}`} className={cn("w-3 h-6 rounded-sm", statusConfig.chairColor)} />
              ))}
            </div>
          </div>

          {/* Bottom chairs */}
          <div className="flex gap-1 justify-center">
            {Array.from({ length: chairLayout.bottom }).map((_, i) => (
              <div key={`b-${i}`} className={cn("w-6 h-3 rounded-sm", statusConfig.chairColor)} />
            ))}
          </div>
        </div>

        <span className="text-xs text-muted-foreground mt-1">{capacity} lugares</span>
      </div>
    </Card>
  );
}
