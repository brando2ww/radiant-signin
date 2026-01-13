import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus, RotateCcw, Maximize2 } from "lucide-react";

interface MapControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  onFitAll: () => void;
}

export function MapControls({ zoom, onZoomChange, onReset, onFitAll }: MapControlsProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 10, 150));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 10, 50));
  };

  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-lg p-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleZoomOut}
        disabled={zoom <= 50}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="w-24 flex items-center gap-2">
        <Slider
          value={[zoom]}
          onValueChange={([value]) => onZoomChange(value)}
          min={50}
          max={150}
          step={5}
          className="w-full"
        />
      </div>
      
      <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleZoomIn}
        disabled={zoom >= 150}
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onFitAll}
        title="Centralizar mesas"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onReset}
        title="Resetar zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
