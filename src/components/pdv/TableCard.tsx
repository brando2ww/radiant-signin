import { Card } from "@/components/ui/card";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TableCardProps {
  table: PDVTable;
  orderTotal?: number;
  orderTime?: string;
  onClick: (table: PDVTable) => void;
  isDragging?: boolean;
}

const STATUS_CONFIG = {
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

function Chair({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-sm transition-colors",
        className
      )}
    />
  );
}

function getChairLayout(capacity: number, shape: string = "square") {
  // Returns chair positions: top, right, bottom, left arrays
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
    return {
      top: halfCapacity,
      right: 0,
      bottom: capacity - halfCapacity,
      left: 0,
    };
  }

  // Square layout
  if (capacity <= 2) {
    return { top: 1, right: 0, bottom: 1, left: 0 };
  }
  if (capacity <= 4) {
    return { top: 1, right: 1, bottom: 1, left: 1 };
  }
  if (capacity <= 6) {
    return { top: 2, right: 1, bottom: 2, left: 1 };
  }
  // 8+
  return { top: 2, right: 2, bottom: 2, left: 2 };
}

export function TableCard({ table, orderTotal, orderTime, onClick, isDragging }: TableCardProps) {
  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.livre;
  const shape = (table as any).shape || "square";
  const chairLayout = getChairLayout(table.capacity, shape);

  const isOccupied = table.status !== "livre";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all p-4 bg-card border-0 shadow-sm",
        isDragging 
          ? "opacity-50 scale-105 shadow-2xl" 
          : "hover:shadow-lg hover:scale-105"
      )}
      onClick={() => onClick(table)}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Status dot */}
        <div className="w-full flex justify-end">
          <div className={cn("w-2.5 h-2.5 rounded-full", statusConfig.dotColor)} />
        </div>

        {/* Table with chairs */}
        <div className="relative flex flex-col items-center gap-1">
          {/* Top chairs */}
          <div className="flex gap-1 justify-center">
            {Array.from({ length: chairLayout.top }).map((_, i) => (
              <Chair
                key={`top-${i}`}
                className={cn("w-6 h-3", statusConfig.chairColor)}
              />
            ))}
          </div>

          {/* Middle row: left chairs + table + right chairs */}
          <div className="flex items-center gap-1">
            {/* Left chairs */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: chairLayout.left }).map((_, i) => (
                <Chair
                  key={`left-${i}`}
                  className={cn("w-3 h-6", statusConfig.chairColor)}
                />
              ))}
            </div>

            {/* Table */}
            <div
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                shape === "round" ? "rounded-full" : "rounded-lg",
                statusConfig.tableColor,
                // Size based on capacity
                table.capacity <= 4 ? "w-20 h-20" : "w-24 h-20"
              )}
            >
              <span className={cn("text-lg font-bold", statusConfig.textColor)}>
                M{table.table_number}
              </span>
              {isOccupied && orderTotal !== undefined && (
                <span className={cn("text-xs font-medium", statusConfig.textColor)}>
                  R$ {orderTotal.toFixed(0)}
                </span>
              )}
              {isOccupied && orderTime && (
                <span className={cn("text-[10px] opacity-80", statusConfig.textColor)}>
                  {orderTime}
                </span>
              )}
            </div>

            {/* Right chairs */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: chairLayout.right }).map((_, i) => (
                <Chair
                  key={`right-${i}`}
                  className={cn("w-3 h-6", statusConfig.chairColor)}
                />
              ))}
            </div>
          </div>

          {/* Bottom chairs */}
          <div className="flex gap-1 justify-center">
            {Array.from({ length: chairLayout.bottom }).map((_, i) => (
              <Chair
                key={`bottom-${i}`}
                className={cn("w-6 h-3", statusConfig.chairColor)}
              />
            ))}
          </div>
        </div>

        {/* Capacity label */}
        <span className="text-xs text-muted-foreground mt-1">
          {table.capacity} lugares
        </span>
      </div>
    </Card>
  );
}

// Sortable wrapper for drag and drop
export function SortableTableCard(props: TableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCard {...props} isDragging={isDragging} />
    </div>
  );
}
