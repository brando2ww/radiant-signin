import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SECTOR_COLORS } from "@/data/sector-colors";
import { PDVSector } from "@/hooks/use-pdv-sectors";

interface SectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
  isSubmitting: boolean;
  sector?: PDVSector | null;
}

export function SectorDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  sector,
}: SectorDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SECTOR_COLORS[0].value);

  useEffect(() => {
    if (open) {
      if (sector) {
        setName(sector.name);
        setColor(sector.color || SECTOR_COLORS[0].value);
      } else {
        setName("");
        setColor(SECTOR_COLORS[0].value);
      }
    }
  }, [open, sector]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    await onSubmit({ name: name.trim(), color });
    setName("");
    setColor(SECTOR_COLORS[0].value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sector ? "Editar Setor" : "Novo Setor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sector-name">Nome do Setor *</Label>
            <Input
              id="sector-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Área Interna, Terraço, Bar..."
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor do Setor</Label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all hover:scale-110",
                    color === c.value 
                      ? "ring-2 ring-offset-2 ring-primary scale-110" 
                      : "hover:ring-1 hover:ring-offset-1 hover:ring-muted-foreground"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cor selecionada: {SECTOR_COLORS.find(c => c.value === color)?.name || "Personalizada"}
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div 
              className="rounded-lg p-3 border-2"
              style={{ 
                backgroundColor: `${color}15`,
                borderColor: `${color}50`
              }}
            >
              <div 
                className="text-sm font-medium text-white px-2 py-1 rounded-md inline-block"
                style={{ backgroundColor: color }}
              >
                {name || "Nome do Setor"}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Salvando..." : sector ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
