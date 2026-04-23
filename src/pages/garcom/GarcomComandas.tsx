import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { GarcomHeader } from "@/components/garcom/GarcomHeader";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { formatTableLabel } from "@/utils/formatTableNumber";

export default function GarcomComandas() {
  const { comandas, comandaItems, isLoading } = usePDVComandas();
  const { tables } = usePDVTables();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const abertas = comandas.filter((c) => c.status === "aberta");
  const filtered = abertas.filter(
    (c) =>
      c.comanda_number.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const tableByOrderId = new Map(
    tables
      .filter((t) => t.current_order_id)
      .map((t) => [t.current_order_id as string, t]),
  );

  return (
    <div>
      <GarcomHeader title="Comandas" />
      <div className="p-4 pb-24 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comanda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-muted-foreground">Nenhuma comanda aberta</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((comanda) => {
              const items = comandaItems.filter((i) => i.comanda_id === comanda.id);
              const total = items.reduce((s, i) => s + i.subtotal, 0);
              const t = comanda.order_id ? tableByOrderId.get(comanda.order_id) : null;
              const origin = t ? formatTableLabel(t.table_number) : "Avulsa";

              return (
                <button
                  key={comanda.id}
                  type="button"
                  onClick={() => navigate(`/garcom/comanda/${comanda.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                    #{comanda.comanda_number.slice(-3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {comanda.customer_name || comanda.comanda_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {origin} · {items.length} {items.length === 1 ? "item" : "itens"} · R$ {total.toFixed(2)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
