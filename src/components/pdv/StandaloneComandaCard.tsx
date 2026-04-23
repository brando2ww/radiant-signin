import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Receipt } from "lucide-react";
import { motion } from "framer-motion";

interface Comanda {
  id: string;
  comanda_number: string;
  customer_name?: string | null;
  subtotal: number;
  created_at: string;
  status: string;
}

interface StandaloneComandaCardProps {
  comanda: Comanda;
  onClick: (comanda: Comanda) => void;
  index?: number;
}

export function StandaloneComandaCard({ comanda, onClick, index = 0 }: StandaloneComandaCardProps) {
  const timeOpen = formatDistanceToNow(new Date(comanda.created_at), {
    locale: ptBR,
    addSuffix: false,
  });

  const comandaShortNumber = comanda.comanda_number.split("-").pop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          "min-w-[150px] max-w-[170px] p-4",
          "bg-card hover:bg-accent",
          "border hover:border-primary/50",
          "shadow-sm hover:shadow-md"
        )}
        onClick={() => onClick(comanda)}
      >
        <div className="flex flex-col gap-2">
          {/* Header: Nome e número */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate leading-tight text-card-foreground">
                {comanda.customer_name || "Sem nome"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Receipt className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  C. {comandaShortNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Tempo aberto */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeOpen}</span>
          </div>

          {/* Valor */}
          <div className="pt-1 border-t">
            <span className="text-lg font-bold text-card-foreground">
              R$ {comanda.subtotal.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
