import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search } from "lucide-react";
import { fetchAllNeighborhoods } from "@/hooks/use-ibge-lookup";

interface NeighborhoodSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uf: string;
  city: string;
  existingNeighborhoods?: string[];
  onConfirm: (selected: string[]) => void;
}

export function NeighborhoodSelectorModal({
  open,
  onOpenChange,
  uf,
  city,
  existingNeighborhoods = [],
  onConfirm,
}: NeighborhoodSelectorModalProps) {
  const [allNeighborhoods, setAllNeighborhoods] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !uf || !city) return;

    setIsLoading(true);
    setFilter("");
    fetchAllNeighborhoods(uf, city).then((neighborhoods) => {
      setAllNeighborhoods(neighborhoods);
      // Pre-select all, but keep existing ones selected too
      const initial = new Set([...neighborhoods, ...existingNeighborhoods]);
      setSelected(initial);
      setIsLoading(false);
    });
  }, [open, uf, city]);

  const filtered = allNeighborhoods.filter((n) =>
    n.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleNeighborhood = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(allNeighborhoods));
  const deselectAll = () => setSelected(new Set());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Bairros — {city}/{uf}</DialogTitle>
          <DialogDescription>
            Marque os bairros que você deseja atender
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Buscando bairros...</p>
          </div>
        ) : allNeighborhoods.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhum bairro encontrado para esta cidade.
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar bairros..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Selecionar todos
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Desmarcar todos
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-md divide-y max-h-[40vh]">
              {filtered.map((name) => (
                <label
                  key={name}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selected.has(name)}
                    onCheckedChange={() => toggleNeighborhood(name)}
                  />
                  <span className="text-sm">{name}</span>
                </label>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Encontrados: {allNeighborhoods.length} bairros · Selecionados:{" "}
              {selected.size}
            </p>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm([...selected]);
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
