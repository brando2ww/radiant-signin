import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

export function StandaloneComandaCard({ comanda, onClick }: StandaloneComandaCardProps) {
  const timeOpen = formatDistanceToNow(new Date(comanda.created_at), {
    locale: ptBR,
    addSuffix: false,
  });

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all p-3 min-w-[140px] max-w-[160px]",
        "bg-red-800 hover:bg-red-700 text-white border-red-900",
        "hover:scale-105 hover:shadow-lg"
      )}
      onClick={() => onClick(comanda)}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm truncate">
            {comanda.customer_name || "Sem nome"}
          </span>
          <span className="text-xs opacity-80 whitespace-nowrap">
            C. {comanda.comanda_number.split("-").pop()}
          </span>
        </div>
        <span className="text-xs opacity-70">{timeOpen}</span>
        <span className="text-sm font-bold">
          R$ {comanda.subtotal.toFixed(2)}
        </span>
      </div>
    </Card>
  );
}
