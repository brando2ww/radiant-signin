import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StandaloneComandaCard } from "./StandaloneComandaCard";

interface Comanda {
  id: string;
  comanda_number: string;
  customer_name?: string | null;
  subtotal: number;
  created_at: string;
  status: string;
  order_id?: string | null;
}

interface StandaloneComandasBarProps {
  comandas: Comanda[];
  onComandaClick: (comanda: Comanda) => void;
  onCreateComanda: () => void;
}

export function StandaloneComandasBar({
  comandas,
  onComandaClick,
  onCreateComanda,
}: StandaloneComandasBarProps) {
  return (
    <div className="border-t bg-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4 p-3">
        {/* Title and create button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              Comandas sem Mesa
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
            onClick={onCreateComanda}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="h-10 w-px bg-slate-600 shrink-0" />

        {/* Comandas scroll area */}
        {comandas.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="flex gap-3 pb-2">
              {comandas.map((comanda) => (
                <StandaloneComandaCard
                  key={comanda.id}
                  comanda={comanda}
                  onClick={onComandaClick}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <span className="text-sm text-slate-400 italic">
            Nenhuma comanda sem mesa
          </span>
        )}
      </div>
    </div>
  );
}
