import { useState, useRef, useCallback, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { DraggableMapTable } from "./DraggableMapTable";
import { MapControls } from "./MapControls";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SalonMapViewProps {
  tables: PDVTable[];
  orders: any[];
  onTableClick: (table: PDVTable) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const GRID_SIZE = 20;

export function SalonMapView({ 
  tables, 
  orders, 
  onTableClick, 
  onPositionChange 
}: SalonMapViewProps) {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const scale = zoom / 100;

  const getOrderForTable = (tableId: string) => {
    return orders.find(order => 
      order.table_id === tableId && 
      !["finalizado", "cancelado"].includes(order.status)
    );
  };

  const formatOrderTime = (createdAt: string) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveDragId(null);
    
    if (!delta.x && !delta.y) return;

    const table = tables.find(t => t.id === active.id);
    if (!table) return;

    const currentX = table.position_x ?? 0;
    const currentY = table.position_y ?? 0;
    
    // Calculate new position with snap to grid
    let newX = Math.round((currentX + delta.x / scale) / GRID_SIZE) * GRID_SIZE;
    let newY = Math.round((currentY + delta.y / scale) / GRID_SIZE) * GRID_SIZE;
    
    // Constrain to map bounds
    newX = Math.max(0, Math.min(newX, MAP_WIDTH - 100));
    newY = Math.max(0, Math.min(newY, MAP_HEIGHT - 100));
    
    onPositionChange(active.id as string, newX, newY);
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('map-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle zoom with scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(prev => Math.max(50, Math.min(150, prev + delta)));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const handleFitAll = () => {
    // Center all tables in view
    if (tables.length === 0) return;
    
    const positions = tables.map(t => ({
      x: t.position_x ?? 0,
      y: t.position_y ?? 0,
    }));
    
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const containerWidth = containerRef.current?.clientWidth ?? 800;
    const containerHeight = containerRef.current?.clientHeight ?? 600;
    
    setPan({
      x: containerWidth / 2 - centerX * scale,
      y: containerHeight / 2 - centerY * scale,
    });
  };

  const activeTable = activeDragId ? tables.find(t => t.id === activeDragId) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <MapControls
          zoom={zoom}
          onZoomChange={setZoom}
          onReset={handleReset}
          onFitAll={handleFitAll}
        />
      </div>
      
      <Card 
        ref={containerRef}
        className={cn(
          "relative overflow-hidden border-2 border-dashed",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ height: "calc(100vh - 300px)", minHeight: 500 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid background */}
        <div 
          className="map-background absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: 0.3,
          }}
        />
        
        {/* Map area */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: MAP_WIDTH * scale,
            height: MAP_HEIGHT * scale,
            position: 'relative',
          }}
        >
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {tables.map(table => {
              const order = getOrderForTable(table.id);
              return (
                <DraggableMapTable
                  key={table.id}
                  table={table}
                  orderTotal={order?.total}
                  orderTime={order ? formatOrderTime(order.created_at) : undefined}
                  onClick={() => onTableClick(table)}
                  zoom={zoom}
                />
              );
            })}
            
            <DragOverlay>
              {activeTable && (
                <div className="opacity-50">
                  <Card className="w-24 h-24 bg-primary/20 border-2 border-primary" />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
        
        {/* Empty state */}
        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p>Nenhuma mesa cadastrada. Adicione mesas para visualizar no mapa.</p>
          </div>
        )}
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <p>Arraste as mesas para posicioná-las • Ctrl + Scroll para zoom • Arraste o fundo para navegar</p>
        </div>
      </Card>
    </div>
  );
}
