import { useState, useCallback, useRef, useEffect } from "react";
import { PDVSector } from "@/hooks/use-pdv-sectors";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Edit2 } from "lucide-react";

interface SectorAreaProps {
  sector: PDVSector;
  zoom: number;
  pan: { x: number; y: number };
  onResize: (id: string, width: number, height: number) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onEdit: (sector: PDVSector) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function SectorArea({
  sector,
  zoom,
  pan,
  onResize,
  onDrag,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}: SectorAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scale = zoom / 100;
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isResizing) return;
    e.stopPropagation();
    onSelect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = sector.position_x;
    const startPosY = sector.position_y;
    
    setIsDragging(true);
    
    const onMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / scale;
      const deltaY = (e.clientY - startY) / scale;
      const newX = Math.max(0, Math.round((startPosX + deltaX) / 10) * 10);
      const newY = Math.max(0, Math.round((startPosY + deltaY) / 10) * 10);
      onDrag(sector.id, newX, newY);
    };
    
    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sector, scale, onDrag, onSelect, isResizing]);

  const handleResize = useCallback((direction: ResizeDirection) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = sector.width;
    const startHeight = sector.height;
    const startPosX = sector.position_x;
    const startPosY = sector.position_y;
    
    setIsResizing(true);
    
    const onMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / scale;
      const deltaY = (e.clientY - startY) / scale;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;
      
      // Handle horizontal resize
      if (direction.includes('e')) {
        newWidth = Math.max(150, startWidth + deltaX);
      }
      if (direction.includes('w')) {
        const widthDelta = Math.min(deltaX, startWidth - 150);
        newWidth = startWidth - widthDelta;
        newX = startPosX + widthDelta;
      }
      
      // Handle vertical resize
      if (direction.includes('s')) {
        newHeight = Math.max(100, startHeight + deltaY);
      }
      if (direction.includes('n')) {
        const heightDelta = Math.min(deltaY, startHeight - 100);
        newHeight = startHeight - heightDelta;
        newY = startPosY + heightDelta;
      }
      
      // Snap to grid
      newWidth = Math.round(newWidth / 10) * 10;
      newHeight = Math.round(newHeight / 10) * 10;
      newX = Math.max(0, Math.round(newX / 10) * 10);
      newY = Math.max(0, Math.round(newY / 10) * 10);
      
      if (newX !== startPosX || newY !== startPosY) {
        onDrag(sector.id, newX, newY);
      }
      onResize(sector.id, newWidth, newHeight);
    };
    
    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sector, scale, onResize, onDrag, onSelect]);

  const resizeHandleClass = "absolute w-3 h-3 bg-background border-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity";
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute rounded-lg transition-shadow group",
        isDragging && "cursor-grabbing",
        !isDragging && !isResizing && "cursor-grab",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        left: (sector.position_x * scale) + pan.x,
        top: (sector.position_y * scale) + pan.y,
        width: sector.width * scale,
        height: sector.height * scale,
        backgroundColor: `${sector.color}15`,
        border: `2px solid ${sector.color}60`,
        zIndex: isSelected ? 5 : 1,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-2 py-1 rounded-t-md cursor-grab"
        style={{ backgroundColor: sector.color }}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 text-white/70" />
          <span className="text-xs font-medium text-white truncate max-w-[120px]">
            {sector.name}
          </span>
        </div>
        
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(sector);
            }}
            className="p-1 rounded hover:bg-white/20 transition-colors"
          >
            <Edit2 className="h-3 w-3 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sector.id);
            }}
            className="p-1 rounded hover:bg-white/20 transition-colors"
          >
            <Trash2 className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>

      {/* Resize handles - only show when selected or hovered */}
      {/* Corners */}
      <div 
        className={cn(resizeHandleClass, "cursor-nw-resize -top-1.5 -left-1.5")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('nw')}
      />
      <div 
        className={cn(resizeHandleClass, "cursor-ne-resize -top-1.5 -right-1.5")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('ne')}
      />
      <div 
        className={cn(resizeHandleClass, "cursor-sw-resize -bottom-1.5 -left-1.5")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('sw')}
      />
      <div 
        className={cn(resizeHandleClass, "cursor-se-resize -bottom-1.5 -right-1.5")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('se')}
      />
      
      {/* Edges */}
      <div 
        className={cn(resizeHandleClass, "cursor-n-resize -top-1.5 left-1/2 -translate-x-1/2 w-6")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('n')}
      />
      <div 
        className={cn(resizeHandleClass, "cursor-s-resize -bottom-1.5 left-1/2 -translate-x-1/2 w-6")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('s')}
      />
      <div 
        className={cn(resizeHandleClass, "cursor-w-resize -left-1.5 top-1/2 -translate-y-1/2 h-6 w-3")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('w')}
      />
      <div 
        className={cn(resizeHandleClass, "cursor-e-resize -right-1.5 top-1/2 -translate-y-1/2 h-6 w-3")}
        style={{ borderColor: sector.color }}
        onMouseDown={handleResize('e')}
      />
    </div>
  );
}
