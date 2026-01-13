import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { Card } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableMapTableProps {
  table: PDVTable;
  orderTotal?: number;
  orderTime?: string;
  onClick: () => void;
  zoom: number;
}

const STATUS_CONFIG = {
  livre: {
    table: "bg-emerald-100 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  ocupada: {
    table: "bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  aguardando_pedido: {
    table: "bg-amber-100 border-amber-300 dark:bg-amber-950 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500 animate-pulse",
  },
  aguardando_cozinha: {
    table: "bg-orange-100 border-orange-300 dark:bg-orange-950 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  pediu_conta: {
    table: "bg-purple-100 border-purple-300 dark:bg-purple-950 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500 animate-pulse",
  },
  pendente_pagamento: {
    table: "bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500 animate-pulse",
  },
};

export function DraggableMapTable({ 
  table, 
  orderTotal, 
  orderTime, 
  onClick,
  zoom 
}: DraggableMapTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    data: { table },
  });

  const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.livre;
  const scale = zoom / 100;

  const style = {
    position: 'absolute' as const,
    left: (table.position_x ?? 0) * scale,
    top: (table.position_y ?? 0) * scale,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const tableSize = table.shape === "rectangle" ? "w-32 h-20" : "w-24 h-24";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Card
        className={cn(
          "border-2 transition-all duration-200 select-none",
          tableSize,
          config.table,
          isDragging && "opacity-80 shadow-2xl scale-105 ring-2 ring-primary",
          "hover:shadow-lg"
        )}
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        <div className="h-full flex flex-col items-center justify-center p-2 gap-1">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", config.dot)} />
            <span className={cn("font-bold text-sm", config.text)}>
              {table.table_number}
            </span>
          </div>
          
          <div className={cn("flex items-center gap-1 text-xs", config.text)}>
            <Users className="h-3 w-3" />
            <span>{table.capacity}</span>
          </div>
          
          {orderTotal !== undefined && orderTotal > 0 && (
            <span className={cn("text-xs font-medium", config.text)}>
              R$ {orderTotal.toFixed(2)}
            </span>
          )}
          
          {orderTime && (
            <div className={cn("flex items-center gap-1 text-xs", config.text)}>
              <Clock className="h-3 w-3" />
              <span>{orderTime}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
