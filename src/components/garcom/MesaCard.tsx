import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PDVTableStatus } from "@/hooks/use-pdv-tables";

const statusConfig: Record<PDVTableStatus, { bg: string; label: string }> = {
  livre: { bg: "bg-emerald-500", label: "Livre" },
  ocupada: { bg: "bg-red-500", label: "Ocupada" },
  aguardando_pedido: { bg: "bg-amber-500", label: "Aguardando" },
  aguardando_cozinha: { bg: "bg-orange-500", label: "Cozinha" },
  pediu_conta: { bg: "bg-blue-500", label: "Conta" },
  pendente_pagamento: { bg: "bg-violet-500", label: "Pagamento" },
};

interface MesaCardProps {
  tableNumber: string;
  status: PDVTableStatus;
  capacity: number;
  onClick: () => void;
}

export function MesaCard({ tableNumber, status, capacity, onClick }: MesaCardProps) {
  const config = statusConfig[status] ?? statusConfig.livre;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl p-4 min-h-[100px] text-white font-semibold shadow-md active:scale-95 transition-transform",
        config.bg
      )}
    >
      <span className="text-2xl font-bold">{tableNumber}</span>
      <span className="mt-1 text-[11px] font-medium opacity-90">{config.label}</span>
      <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] opacity-80">
        <Users className="h-3 w-3" />
        {capacity}
      </span>
    </button>
  );
}
