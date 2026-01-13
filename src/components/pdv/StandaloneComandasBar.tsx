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
    <div className="border-t-2 border-purple-900/50 bg-gradient-to-r from-purple-950 via-[#3d1a32] to-purple-950 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-purple-800/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-800/50">
            <Receipt className="h-4 w-4 text-purple-200" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Comandas sem Mesa
            </h3>
            {comandaCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                {comandaCount}
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          onClick={onCreateComanda}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-200"
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
                <ScrollBar orientation="horizontal" className="bg-purple-800/30" />
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
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-800/30 mb-3">
                <ClipboardList className="h-7 w-7 text-purple-300/60" />
              </div>
              <p className="text-purple-200/80 text-sm font-medium">
                Nenhuma comanda avulsa
              </p>
              <p className="text-purple-300/50 text-xs mt-1">
                Clique em "Nova Comanda" para criar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
