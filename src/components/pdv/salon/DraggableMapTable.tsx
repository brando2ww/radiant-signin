import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { cn } from "@/lib/utils";
import { formatBRLCompact } from "@/lib/format";
import { formatTableLabel } from "@/utils/formatTableNumber";

interface DraggableMapTableProps {
  table: PDVTable;
  mergedTable?: PDVTable | null;
  orderTotal?: number;
  orderTime?: string;
  onClick: (e: React.MouseEvent) => void;
  zoom: number;
  isSelectedForMerge?: boolean;
  sectorColor?: string;
}

const STATUS_CONFIG = {
  livre: {
    table: "bg-emerald-100 border-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700",
    chair: "bg-emerald-200 dark:bg-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  ocupada: {
    table: "bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700",
    chair: "bg-blue-200 dark:bg-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  aguardando_pedido: {
    table: "bg-amber-100 border-amber-300 dark:bg-amber-900/50 dark:border-amber-700",
    chair: "bg-amber-200 dark:bg-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500 animate-pulse",
  },
  aguardando_cozinha: {
    table: "bg-orange-100 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700",
    chair: "bg-orange-200 dark:bg-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  pediu_conta: {
    table: "bg-purple-100 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700",
    chair: "bg-purple-200 dark:bg-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500 animate-pulse",
  },
  pendente_pagamento: {
    table: "bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700",
    chair: "bg-red-200 dark:bg-red-800",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500 animate-pulse",
  },
};

function Chair({ className, horizontal = true, style }: { className?: string; horizontal?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "rounded-sm",
        horizontal ? "w-4 h-2" : "w-2 h-4",
        className
      )}
      style={style}
    />
  );
}

function getChairLayout(capacity: number, shape: string) {
  if (shape === "round") {
    const perSide = Math.ceil(capacity / 4);
    return { top: perSide, right: perSide, bottom: perSide, left: perSide };
  }
  
  if (shape === "rectangle") {
    const longSide = Math.ceil(capacity / 2);
    const shortSide = Math.floor(capacity / 4);
    return { top: longSide, right: shortSide, bottom: longSide, left: shortSide };
  }
  
  // Square
  const perSide = Math.ceil(capacity / 4);
  return { top: perSide, right: perSide, bottom: perSide, left: perSide };
}

// Helper to generate styles based on sector color
const getSectorStyles = (color: string) => ({
  tableStyle: { 
    backgroundColor: `${color}20`, // 12% opacity
    borderColor: color 
  },
  chairStyle: { backgroundColor: `${color}50` }, // 31% opacity
  textStyle: { color: color }
});

export function DraggableMapTable({ 
  table, 
  mergedTable,
  orderTotal, 
  orderTime, 
  onClick,
  zoom,
  isSelectedForMerge = false,
  sectorColor
}: DraggableMapTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    data: { table },
  });

  const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.livre;
  const hasSectorColor = !!sectorColor;
  const sectorStyles = hasSectorColor ? getSectorStyles(sectorColor) : null;
  const scale = zoom / 100;
  const isMerged = !!mergedTable;
  const totalCapacity = isMerged ? table.capacity + mergedTable.capacity : table.capacity;
  const chairLayout = getChairLayout(totalCapacity, isMerged ? "rectangle" : table.shape);

  const style = {
    position: 'absolute' as const,
    left: (table.position_x ?? 0) * scale,
    top: (table.position_y ?? 0) * scale,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : isSelectedForMerge ? 500 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const getTableShape = () => {
    if (isMerged) {
      return "rounded-lg w-28 h-14"; // Wider for merged tables
    }
    switch (table.shape) {
      case "round":
        return "rounded-full w-14 h-14";
      case "rectangle":
        return "rounded-lg w-20 h-12";
      default:
        return "rounded-lg w-14 h-14";
    }
  };

  const getTableLabel = () => {
    if (isMerged && mergedTable) {
      return `${formatTableLabel(table.table_number)} + ${formatTableLabel(mergedTable.table_number)}`;
    }
    return formatTableLabel(table.table_number);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      className={cn(
        "select-none transition-all duration-200",
        isDragging && "opacity-80 scale-105",
        isSelectedForMerge && "animate-pulse"
      )}
    >
      {/* Selection ring for merge */}
      {isSelectedForMerge && (
        <div className="absolute -inset-2 rounded-xl border-2 border-blue-500 bg-blue-500/10 pointer-events-none" />
      )}
      
      <div className="flex flex-col items-center gap-0.5">
        {/* Status dot */}
        <div className="w-full flex justify-end pr-1">
          <div className={cn("w-2 h-2 rounded-full", config.dot)} />
        </div>

        {/* Table with chairs */}
        <div className="relative flex flex-col items-center gap-0.5">
          {/* Top chairs */}
          <div className="flex gap-0.5 justify-center">
            {Array.from({ length: chairLayout.top }).map((_, i) => (
              <Chair key={`top-${i}`} className={!hasSectorColor ? config.chair : undefined} style={sectorStyles?.chairStyle} horizontal />
            ))}
          </div>

          {/* Middle row: left chairs + table + right chairs */}
          <div className="flex items-center gap-0.5">
            {/* Left chairs */}
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: chairLayout.left }).map((_, i) => (
                <Chair key={`left-${i}`} className={!hasSectorColor ? config.chair : undefined} style={sectorStyles?.chairStyle} horizontal={false} />
              ))}
            </div>

            {/* Table */}
            <div
              className={cn(
                "flex flex-col items-center justify-center border-2 transition-all",
                getTableShape(),
                !hasSectorColor && config.table,
                isDragging && "ring-2 ring-primary shadow-xl",
                isMerged && "border-dashed border-2"
              )}
              style={sectorStyles?.tableStyle}
            >
              <span className={cn("font-bold text-xs", !hasSectorColor && config.text)} style={sectorStyles?.textStyle}>
                {getTableLabel()}
              </span>
              {orderTotal !== undefined && orderTotal > 0 && (
                <span className={cn("text-[10px] font-medium", !hasSectorColor && config.text)} style={sectorStyles?.textStyle}>
                  {formatBRLCompact(orderTotal)}
                </span>
              )}
              {orderTime && (
                <span className={cn("text-[10px]", !hasSectorColor && config.text)} style={sectorStyles?.textStyle}>
                  {orderTime}
                </span>
              )}
            </div>

            {/* Right chairs */}
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: chairLayout.right }).map((_, i) => (
                <Chair key={`right-${i}`} className={!hasSectorColor ? config.chair : undefined} style={sectorStyles?.chairStyle} horizontal={false} />
              ))}
            </div>
          </div>

          {/* Bottom chairs */}
          <div className="flex gap-0.5 justify-center">
            {Array.from({ length: chairLayout.bottom }).map((_, i) => (
              <Chair key={`bottom-${i}`} className={!hasSectorColor ? config.chair : undefined} style={sectorStyles?.chairStyle} horizontal />
            ))}
          </div>
        </div>


        {/* Capacity label */}
        <span className={cn("text-[10px] font-medium", !hasSectorColor && config.text)} style={sectorStyles?.textStyle}>
          {totalCapacity} lugares
        </span>
      </div>
    </div>
  );
}
