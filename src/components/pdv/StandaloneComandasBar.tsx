import { Button } from "@/components/ui/button";
import { Plus, Receipt, ClipboardList } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StandaloneComandaCard } from "./StandaloneComandaCard";
import { motion, AnimatePresence } from "framer-motion";

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
  const comandaCount = comandas.length;

  return (
    <div className="border-t bg-muted/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Comandas sem Mesa
            </h3>
            {comandaCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                {comandaCount}
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          onClick={onCreateComanda}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nova Comanda
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 min-h-[120px]">
        <AnimatePresence mode="wait">
          {comandaCount > 0 ? (
            <motion.div
              key="comandas-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {comandas.map((comanda, index) => (
                    <StandaloneComandaCard
                      key={comanda.id}
                      comanda={comanda}
                      onClick={onComandaClick}
                      index={index}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-4 text-center"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
                <ClipboardList className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Nenhuma comanda avulsa
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Clique em "Nova Comanda" para criar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
