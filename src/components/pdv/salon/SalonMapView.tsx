import { useState, useRef, useCallback, useEffect } from "react";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { PDVSector } from "@/hooks/use-pdv-sectors";
import { DraggableMapTable } from "./DraggableMapTable";
import { SectorArea } from "./SectorArea";
import { MapControls } from "./MapControls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Layers } from "lucide-react";

interface SalonMapViewProps {
  tables: PDVTable[];
  orders: any[];
  sectors: PDVSector[];
  onTableClick: (table: PDVTable) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onMergeTables?: (tableId1: string, tableId2: string) => void;
  onSectorDrag: (id: string, x: number, y: number) => void;
  onSectorResize: (id: string, width: number, height: number) => void;
  onSectorEdit: (sector: PDVSector) => void;
  onSectorDelete: (id: string) => void;
  onCreateSector: () => void;
}

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const GRID_SIZE = 20;

export function SalonMapView({ 
  tables, 
  orders, 
  sectors,
  onTableClick, 
  onPositionChange,
  onMergeTables,
  onSectorDrag,
  onSectorResize,
  onSectorEdit,
  onSectorDelete,
  onCreateSector,
}: SalonMapViewProps) {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mergeSourceTable, setMergeSourceTable] = useState<PDVTable | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cancel merge selection on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mergeSourceTable) {
          setMergeSourceTable(null);
          toast.info("Seleção de união cancelada");
        }
        setSelectedSectorId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mergeSourceTable]);

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

  const getMergedTable = (tableId: string | null) => {
    if (!tableId) return null;
    return tables.find(t => t.id === tableId) || null;
  };

  const getSectorForTable = (sectorId: string | null) => {
    if (!sectorId) return null;
    return sectors.find(s => s.id === sectorId) || null;
  };

  const handleTableClickWithMerge = (table: PDVTable, event: React.MouseEvent) => {
    setSelectedSectorId(null);
    
    // If Shift is pressed and onMergeTables is available
    if (event.shiftKey && onMergeTables) {
      // Only square tables can be merged
      if (table.shape !== "square") {
        toast.error("Apenas mesas quadradas podem ser unidas");
        return;
      }

      // Table already merged
      if (table.merged_with) {
        toast.error("Esta mesa já está unida a outra");
        return;
      }

      if (!mergeSourceTable) {
        // First table selected
        setMergeSourceTable(table);
        toast.info(`Mesa M${table.table_number} selecionada. Shift+Click em outra mesa quadrada para unir.`);
      } else if (mergeSourceTable.id !== table.id) {
        // Second table - perform merge
        onMergeTables(mergeSourceTable.id, table.id);
        setMergeSourceTable(null);
      }
      return;
    }

    // Normal click - cancel merge selection and open table
    setMergeSourceTable(null);
    onTableClick(table);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
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

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('map-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedSectorId(null);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateSector}
        >
          <Layers className="h-4 w-4 mr-2" />
          Novo Setor
        </Button>
        
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
        
        {/* Sector areas - rendered behind tables */}
        {sectors.map(sector => (
          <SectorArea
            key={sector.id}
            sector={sector}
            zoom={zoom}
            pan={pan}
            onResize={onSectorResize}
            onDrag={onSectorDrag}
            onEdit={onSectorEdit}
            onDelete={onSectorDelete}
            isSelected={selectedSectorId === sector.id}
            onSelect={() => setSelectedSectorId(sector.id)}
          />
        ))}
        
        {/* Map area with tables */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: MAP_WIDTH * scale,
            height: MAP_HEIGHT * scale,
            position: 'relative',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <div style={{ pointerEvents: 'auto' }}>
              {tables
                .filter(table => !table.merged_with || tables.find(t => t.merged_with === table.id))
                .map(table => {
                  // Skip tables that are merged INTO another (they'll show as part of the primary)
                  const mergedTable = getMergedTable(table.merged_with);
                  
                  // If this table has a lower ID and is merged, it's the "secondary" - skip it
                  if (table.merged_with && mergedTable && table.id > mergedTable.id) {
                    return null;
                  }

                  const order = getOrderForTable(table.id);
                  const mergedOrder = mergedTable ? getOrderForTable(mergedTable.id) : null;
                  const combinedTotal = (order?.total || 0) + (mergedOrder?.total || 0);
                  const sector = getSectorForTable(table.sector_id);

                  return (
                    <DraggableMapTable
                      key={table.id}
                      table={table}
                      mergedTable={mergedTable}
                      orderTotal={combinedTotal > 0 ? combinedTotal : order?.total}
                      orderTime={order ? formatOrderTime(order.created_at) : undefined}
                      onClick={(e) => handleTableClickWithMerge(table, e)}
                      zoom={zoom}
                      isSelectedForMerge={mergeSourceTable?.id === table.id}
                      sectorColor={sector?.color}
                    />
                  );
                })}
            </div>
          </DndContext>
        </div>
        
        {/* Empty state */}
        {tables.length === 0 && sectors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-20">
            <p>Nenhuma mesa ou setor cadastrado. Adicione setores e mesas para visualizar no mapa.</p>
          </div>
        )}
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 z-20">
          <p>Arraste as mesas para posicioná-las • Shift+Click para unir mesas • Arraste cantos dos setores para redimensionar • Ctrl + Scroll para zoom</p>
        </div>
      </Card>
    </div>
  );
}
