import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { formatTableLabel } from "@/utils/formatTableNumber";
import {
  Hourglass,
  RefreshCw,
  Users,
  Receipt,
  UtensilsCrossed,
  Soup,
} from "lucide-react";
import { usePDVComandas, Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";
import { usePDVTables, PDVTable } from "@/hooks/use-pdv-tables";
import { SalonQueueCard } from "./SalonQueueCard";

interface SalonQueuePanelProps {
  isOpen: boolean;
  onSelectComanda: (comanda: Comanda, items: ComandaItem[]) => void;
  onSelectTablePending: (
    table: PDVTable,
    comandas: Comanda[],
    items: ComandaItem[],
  ) => void;
  onOpenDirectCharge: () => void;
}

type SortOption = "time" | "value" | "table" | "name";

const GROUP_COLORS = [
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-pink-500",
  "border-l-violet-500",
  "border-l-cyan-500",
];
function getGroupColor(orderId: string | null) {
  if (!orderId) return "border-l-slate-400";
  let h = 0;
  for (let i = 0; i < orderId.length; i++) h = (h * 31 + orderId.charCodeAt(i)) | 0;
  return GROUP_COLORS[Math.abs(h) % GROUP_COLORS.length];
}

export function SalonQueuePanel({
  isOpen,
  onSelectComanda,
  onSelectTablePending,
  onOpenDirectCharge,
}: SalonQueuePanelProps) {
  const queryClient = useQueryClient();
  const {
    comandas,
    getItemsByComanda,
    getPendingPaymentComandas,
  } = usePDVComandas();
  const { tables } = usePDVTables();

  // Re-render a cada minuto para atualizar contadores de tempo
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const [sortBy, setSortBy] = useState<SortOption>("time");

  const tablesByOrderId = useMemo(() => {
    const m = new Map<string, PDVTable>();
    tables.forEach((t) => {
      if (t.current_order_id) m.set(t.current_order_id, t);
    });
    return m;
  }, [tables]);

  const pendingComandas = getPendingPaymentComandas();

  // Conta comandas "abertas/em_cobranca" por order_id (para indicador "mesa tem mais N")
  const openCountByOrderId = useMemo(() => {
    const m = new Map<string, number>();
    comandas.forEach((c) => {
      if (!c.order_id) return;
      if (c.status === "aberta" || c.status === "em_cobranca") {
        m.set(c.order_id, (m.get(c.order_id) ?? 0) + 1);
      }
    });
    return m;
  }, [comandas]);

  type GroupedItem = {
    key: string;
    table: PDVTable | null;
    label: string;
    color: string;
    comandas: Comanda[];
    total: number;
    oldestAt: number;
  };

  const groups = useMemo<GroupedItem[]>(() => {
    const map = new Map<string, GroupedItem>();
    pendingComandas.forEach((c) => {
      const key = c.order_id ?? `__avulsa__${c.id}`;
      const t = c.order_id ? tablesByOrderId.get(c.order_id) ?? null : null;
      const label = t
        ? formatTableLabel(t.table_number)
        : `Avulsa — ${c.customer_name ?? `#${c.comanda_number}`}`;
      const ts = new Date(c.closed_by_waiter_at ?? c.updated_at).getTime();
      const existing = map.get(key);
      if (existing) {
        existing.comandas.push(c);
        existing.total += c.subtotal;
        existing.oldestAt = Math.min(existing.oldestAt, ts);
      } else {
        map.set(key, {
          key,
          table: t,
          label,
          color: getGroupColor(c.order_id),
          comandas: [c],
          total: c.subtotal,
          oldestAt: ts,
        });
      }
    });

    const arr = Array.from(map.values());

    // Ordena comandas dentro do grupo
    arr.forEach((g) => {
      g.comandas.sort((a, b) => {
        const at = new Date(a.closed_by_waiter_at ?? a.updated_at).getTime();
        const bt = new Date(b.closed_by_waiter_at ?? b.updated_at).getTime();
        return at - bt;
      });
    });

    // Ordena grupos
    const now = Date.now();
    const isAlertGroup = (g: GroupedItem) => (now - g.oldestAt) / 60_000 >= 10;

    arr.sort((a, b) => {
      // Pin: alertas (>10min) sempre no topo
      const aAlert = isAlertGroup(a);
      const bAlert = isAlertGroup(b);
      if (aAlert !== bAlert) return aAlert ? -1 : 1;

      switch (sortBy) {
        case "value":
          return b.total - a.total;
        case "table": {
          const an = a.table?.table_number ?? "zzz";
          const bn = b.table?.table_number ?? "zzz";
          return an.localeCompare(bn, "pt-BR", { numeric: true });
        }
        case "name": {
          const an = a.comandas[0]?.customer_name ?? a.label;
          const bn = b.comandas[0]?.customer_name ?? b.label;
          return an.localeCompare(bn, "pt-BR");
        }
        case "time":
        default:
          return a.oldestAt - b.oldestAt;
      }
    });

    return arr;
  }, [pendingComandas, tablesByOrderId, sortBy]);

  const totalCount = pendingComandas.length;
  const totalValue = pendingComandas.reduce((s, c) => s + c.subtotal, 0);
  const avgWaitMin = useMemo(() => {
    if (pendingComandas.length === 0) return 0;
    const now = Date.now();
    const total = pendingComandas.reduce((s, c) => {
      const ts = new Date(c.closed_by_waiter_at ?? c.updated_at).getTime();
      return s + Math.max(0, (now - ts) / 60_000);
    }, 0);
    return Math.round(total / pendingComandas.length);
  }, [pendingComandas]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
    queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
    queryClient.invalidateQueries({ queryKey: ["pdv-tables"] });
  };

  const handleSelectGroupAll = (group: GroupedItem) => {
    if (!group.table) return;
    const items = group.comandas.flatMap((c) => getItemsByComanda(c.id));
    onSelectTablePending(group.table, group.comandas, items);
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-3 pt-3 pb-2 border-b">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Soup className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Salão</h3>
            {totalCount > 0 && (
              <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                {totalCount}
              </Badge>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleRefresh}
            title="Atualizar"
            aria-label="Atualizar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isOpen && totalCount > 0 ? (
          <div className="space-y-0.5 mb-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {totalCount} comanda{totalCount > 1 ? "s" : ""}
              </span>{" "}
              aguardando cobrança
            </div>
            <div className="text-xs text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {formatBRL(totalValue)}
              </span>{" "}
              · Média de espera:{" "}
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  avgWaitMin >= 10
                    ? "text-destructive"
                    : avgWaitMin >= 5
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-foreground",
                )}
              >
                {avgWaitMin} min
              </span>
            </div>
          </div>
        ) : (
          isOpen && (
            <div className="text-xs text-muted-foreground mb-2">
              Sem comandas na fila no momento.
            </div>
          )
        )}

        {totalCount > 0 && (
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Mais antigas primeiro</SelectItem>
              <SelectItem value="value">Maior valor</SelectItem>
              <SelectItem value="table">Mesa</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Lista */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-4">
          {!isOpen ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-12 text-center">
              <Hourglass className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-xs">Abra o caixa para ver a fila do salão.</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-12 text-center">
              <UtensilsCrossed className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">
                Tudo em dia!
              </p>
              <p className="text-xs mt-1">
                Nenhuma comanda aguardando cobrança.
              </p>
            </div>
          ) : (
            groups.map((group) => {
              const isMulti = !!group.table && group.comandas.length > 1;
              return (
                <div key={group.key} className="space-y-2">
                  {isMulti && (
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "w-1 h-4 rounded-sm",
                            group.color.replace("border-l-", "bg-"),
                          )}
                        />
                        <span className="font-semibold text-xs truncate">
                          {group.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {group.comandas.length} · {formatBRL(group.total)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-[11px] gap-1 px-2"
                        onClick={() => handleSelectGroupAll(group)}
                      >
                        <Users className="h-3 w-3" />
                        Cobrar tudo
                      </Button>
                    </div>
                  )}

                  {group.comandas.map((c) => {
                    const items = getItemsByComanda(c.id);
                    const ts = new Date(
                      c.closed_by_waiter_at ?? c.updated_at,
                    ).getTime();
                    const minutes = Math.max(0, Math.floor((Date.now() - ts) / 60_000));
                    const tableLabel = group.table
                      ? formatTableLabel(group.table.table_number)
                      : null;
                    const customer =
                      c.customer_name ?? `#${c.comanda_number}`;
                    const title = tableLabel
                      ? `${tableLabel} — ${customer}`
                      : `Avulsa — ${customer}`;
                    // Contar siblings (mesa tem outras abertas)
                    const siblings = c.order_id
                      ? openCountByOrderId.get(c.order_id) ?? 0
                      : 0;
                    return (
                      <SalonQueueCard
                        key={c.id}
                        comanda={c}
                        items={items}
                        title={title}
                        borderColor={group.color}
                        siblingCount={siblings}
                        waitingMinutes={minutes}
                        onCharge={() => onSelectComanda(c, items)}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Rodapé com cobrança avulsa/direta */}
      {isOpen && (
        <div className="border-t p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs gap-2"
            onClick={onOpenDirectCharge}
          >
            <Receipt className="h-3.5 w-3.5" />
            Cobrar comanda avulsa / mesa direta
          </Button>
        </div>
      )}
    </div>
  );
}
