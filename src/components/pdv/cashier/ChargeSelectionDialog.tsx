import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatTableLabel } from "@/utils/formatTableNumber";
import { formatBRL } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  UtensilsCrossed,
  Clock,
  XCircle,
  User,
  Search,
  ArrowUpDown,
  ShoppingBag,
  Hourglass,
  Users,
  Loader2,
} from "lucide-react";
import { usePDVComandas, Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";
import { usePDVTables, PDVTable } from "@/hooks/use-pdv-tables";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ChargeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComanda: (comanda: Comanda, items: ComandaItem[]) => void;
  onSelectTable: (table: PDVTable, comandas: Comanda[], items: ComandaItem[]) => void;
  /** Pendentes (vindas do garçom) — todas as comandas aguardando da mesa */
  onSelectTablePending?: (table: PDVTable, comandas: Comanda[], items: ComandaItem[]) => void;
  onCancelComanda?: (comandaId: string) => void;
  onCancelTable?: (tableId: string, orderId: string) => void;
}

type SortOption = "time" | "value" | "number";

// Cor de borda determinística por order_id (agrupamento visual no caixa)
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

export function ChargeSelectionDialog({
  open,
  onOpenChange,
  onSelectComanda,
  onSelectTable,
  onSelectTablePending,
  onCancelComanda,
  onCancelTable,
}: ChargeSelectionDialogProps) {
  const [tab, setTab] = useState<"pendentes" | "comandas" | "mesas">("pendentes");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("time");
  const [cancelTarget, setCancelTarget] = useState<{ type: "comanda" | "table"; id: string; orderId?: string; label: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const {
    comandas,
    getItemsByComanda,
    getStandaloneComandas,
    getPendingPaymentComandas,
  } = usePDVComandas();
  const { tables } = usePDVTables();

  const pendingComandas = getPendingPaymentComandas();
  const standaloneComandas = getStandaloneComandas();
  const occupiedTables = tables.filter(
    (t) => t.status !== "livre" && t.current_order_id,
  );

  const tablesByOrderId = useMemo(() => {
    const m = new Map<string, PDVTable>();
    tables.forEach((t) => {
      if (t.current_order_id) m.set(t.current_order_id, t);
    });
    return m;
  }, [tables]);

  // Get comandas for a table (somente abertas pelo caixa; comandas pendentes ficam na aba "Aguardando")
  const getComandasForTable = (table: PDVTable) => {
    if (!table.current_order_id) return [];
    return comandas.filter(
      (c) => c.order_id === table.current_order_id && c.status === "aberta",
    );
  };

  const getTableTotal = (table: PDVTable) => {
    return getComandasForTable(table).reduce((sum, c) => sum + c.subtotal, 0);
  };

  const getTimeStatus = (createdAt: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(createdAt));
    if (minutes < 30) return "bg-green-500";
    if (minutes < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // ---------- Aba "Aguardando" ----------
  // Agrupa por order_id (mesa) + grupo "avulsa" para comandas sem order
  type PendingGroup = {
    key: string;
    table: PDVTable | null;
    label: string;
    comandas: Comanda[];
    total: number;
    oldestAt: number;
    color: string;
  };

  const pendingGroups = useMemo<PendingGroup[]>(() => {
    const filtered = pendingComandas.filter((c) => {
      if (!search) return true;
      const s = search.toLowerCase();
      const t = c.order_id ? tablesByOrderId.get(c.order_id) : null;
      return (
        c.comanda_number.toLowerCase().includes(s) ||
        (c.customer_name ?? "").toLowerCase().includes(s) ||
        (t ? formatTableLabel(t.table_number).toLowerCase().includes(s) : false)
      );
    });

    const map = new Map<string, PendingGroup>();
    filtered.forEach((c) => {
      const key = c.order_id ?? `__avulsa__${c.id}`;
      const t = c.order_id ? tablesByOrderId.get(c.order_id) ?? null : null;
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
          label: t ? formatTableLabel(t.table_number) : "Avulsa",
          comandas: [c],
          total: c.subtotal,
          oldestAt: ts,
          color: getGroupColor(c.order_id),
        });
      }
    });

    const groups = Array.from(map.values());
    // Ordena comandas dentro do grupo por tempo de espera (mais antigas primeiro)
    groups.forEach((g) => g.comandas.sort((a, b) => {
      const av = new Date(a.closed_by_waiter_at ?? a.updated_at).getTime();
      const bv = new Date(b.closed_by_waiter_at ?? b.updated_at).getTime();
      return av - bv;
    }));
    // Ordena grupos
    groups.sort((a, b) => a.oldestAt - b.oldestAt);
    return groups;
  }, [pendingComandas, search, tablesByOrderId]);

  const totalPending = pendingComandas.length;

  // Filtros das demais abas
  const filteredComandas = useMemo(() => {
    let result = standaloneComandas.filter((c) => {
      const s = search.toLowerCase();
      return (
        c.comanda_number.toLowerCase().includes(s) ||
        (c.customer_name ?? "").toLowerCase().includes(s)
      );
    });
    switch (sortBy) {
      case "time":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "value":
        result.sort((a, b) => b.subtotal - a.subtotal);
        break;
      case "number":
        result.sort((a, b) => a.comanda_number.localeCompare(b.comanda_number));
        break;
    }
    return result;
  }, [standaloneComandas, search, sortBy]);

  const filteredTables = useMemo(() => {
    let result = occupiedTables.filter((t) => {
      const s = search.toLowerCase();
      return formatTableLabel(t.table_number).toLowerCase().includes(s);
    });
    switch (sortBy) {
      case "time":
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case "value":
        result.sort((a, b) => getTableTotal(b) - getTableTotal(a));
        break;
      case "number":
        result.sort((a, b) => a.table_number.localeCompare(b.table_number));
        break;
    }
    return result;
  }, [occupiedTables, search, sortBy]);

  const handleSelectPendingComanda = (comanda: Comanda) => {
    onSelectComanda(comanda, getItemsByComanda(comanda.id));
  };

  const handleSelectPendingGroup = (group: PendingGroup) => {
    if (!group.table) return;
    const items = group.comandas.flatMap((c) => getItemsByComanda(c.id));
    if (onSelectTablePending) {
      onSelectTablePending(group.table, group.comandas, items);
    } else {
      onSelectTable(group.table, group.comandas, items);
    }
  };

  const handleSelectComandaCard = (comanda: Comanda) => {
    onSelectComanda(comanda, getItemsByComanda(comanda.id));
  };

  const handleSelectTableCard = (table: PDVTable) => {
    const tableComandas = getComandasForTable(table);
    const allItems = tableComandas.flatMap((c) => getItemsByComanda(c.id));
    onSelectTable(table, tableComandas, allItems);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    if (cancelTarget.type === "comanda" && onCancelComanda) {
      onCancelComanda(cancelTarget.id);
    } else if (cancelTarget.type === "table" && onCancelTable && cancelTarget.orderId) {
      onCancelTable(cancelTarget.id, cancelTarget.orderId);
    }
    setCancelTarget(null);
    setCancelReason("");
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Cobranças do Salão
          </DialogTitle>
          <DialogDescription>
            Comandas enviadas pelo garçom ficam em "Aguardando".
          </DialogDescription>
        </DialogHeader>

        {/* Search and Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por mesa, número ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {tab !== "pendentes" && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Mais recente</SelectItem>
                <SelectItem value="value">Maior valor</SelectItem>
                <SelectItem value="number">Número</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pendentes" className="gap-2">
              <Hourglass className="h-4 w-4" />
              Aguardando
              {totalPending > 0 && (
                <Badge
                  className={cn(
                    "ml-1 bg-orange-500 text-white hover:bg-orange-500",
                  )}
                >
                  {totalPending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comandas" className="gap-2">
              <Receipt className="h-4 w-4" />
              Comandas
              {filteredComandas.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filteredComandas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mesas" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Mesas
              {filteredTables.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filteredTables.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ============== Aguardando ============== */}
          <TabsContent value="pendentes" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {pendingGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground py-8">
                  <Hourglass className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">
                    {search ? "Nada encontrado" : "Nenhuma comanda aguardando cobrança"}
                  </p>
                  <p className="text-xs mt-1">
                    Comandas fechadas pelo garçom aparecem aqui automaticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingGroups.map((group) => {
                    const isMulti = !!group.table && group.comandas.length > 1;
                    const minutes = Math.floor((Date.now() - group.oldestAt) / 60000);
                    return (
                      <div key={group.key} className="space-y-2">
                        {/* Cabeçalho do grupo (mesa) */}
                        <div className="flex items-center justify-between gap-2 px-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={cn("w-1.5 h-5 rounded-sm", group.color.replace("border-l-", "bg-"))} />
                            <span className="font-semibold text-sm truncate">
                              {group.label}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {group.comandas.length}{" "}
                              {group.comandas.length === 1 ? "comanda" : "comandas"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatBRL(group.total)}
                            </span>
                          </div>
                          {isMulti && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleSelectPendingGroup(group)}
                            >
                              <Users className="h-3 w-3" />
                              Cobrar tudo
                            </Button>
                          )}
                        </div>

                        {/* Cards das comandas pendentes */}
                        <div className="space-y-2">
                          {group.comandas.map((comanda) => {
                            const items = getItemsByComanda(comanda.id);
                            const waitedAt = comanda.closed_by_waiter_at ?? comanda.updated_at;
                            const isCharging = comanda.status === "em_cobranca";
                            return (
                              <HoverCard key={comanda.id} openDelay={300}>
                                <HoverCardTrigger asChild>
                                  <Card
                                    className={cn(
                                      "cursor-pointer hover:bg-accent/50 transition-colors group border-l-4",
                                      group.color,
                                      isCharging && "opacity-70",
                                    )}
                                    onClick={() => handleSelectPendingComanda(comanda)}
                                    aria-busy={isCharging}
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm truncate">
                                              {comanda.customer_name ?? `#${comanda.comanda_number}`}
                                            </span>
                                            <Badge variant="outline" className="text-[10px]">
                                              {items.length}{" "}
                                              {items.length === 1 ? "item" : "itens"}
                                            </Badge>
                                            {isCharging ? (
                                              <Badge className="bg-blue-500 text-white hover:bg-blue-500 gap-1 text-[10px]">
                                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                Em cobrança
                                              </Badge>
                                            ) : (
                                              <Badge className="bg-orange-500 text-white hover:bg-orange-500 text-[10px]">
                                                Aguardando
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            Aguardando há{" "}
                                            {formatDistanceToNow(new Date(waitedAt), {
                                              locale: ptBR,
                                            })}
                                          </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="text-base font-bold text-primary">
                                            {formatBRL(comanda.subtotal)}
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="w-64">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <ShoppingBag className="h-4 w-4" />
                                      Itens — {comanda.customer_name ?? `#${comanda.comanda_number}`}
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      {items.slice(0, 5).map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex justify-between text-muted-foreground"
                                        >
                                          <span>
                                            {item.quantity}x {item.product_name}
                                          </span>
                                          <span>{formatBRL(item.subtotal)}</span>
                                        </div>
                                      ))}
                                      {items.length > 5 && (
                                        <p className="text-xs text-muted-foreground">
                                          +{items.length - 5} mais itens...
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ============== Comandas avulsas ============== */}
          <TabsContent value="comandas" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {filteredComandas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Receipt className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">
                    {search ? "Nenhuma comanda encontrada" : "Nenhuma comanda avulsa aberta"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredComandas.map((comanda) => {
                    const items = getItemsByComanda(comanda.id);
                    return (
                      <HoverCard key={comanda.id} openDelay={300}>
                        <HoverCardTrigger asChild>
                          <Card
                            className="cursor-pointer hover:bg-accent/50 transition-colors group"
                            onClick={() => handleSelectComandaCard(comanda)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        getTimeStatus(comanda.created_at),
                                      )}
                                    />
                                    <span className="font-semibold">
                                      #{comanda.comanda_number}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {items.length} {items.length === 1 ? "item" : "itens"}
                                    </Badge>
                                  </div>
                                  {comanda.customer_name && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      {comanda.customer_name}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(comanda.created_at), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <span className="text-lg font-bold text-primary group-hover:scale-105 transition-transform inline-block">
                                    {formatBRL(comanda.subtotal)}
                                  </span>
                                  {onCancelComanda && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelTarget({ type: "comanda", id: comanda.id, label: `#${comanda.comanda_number}` });
                                      }}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-64">
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              Itens do Pedido
                            </h4>
                            <div className="space-y-1 text-sm">
                              {items.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-muted-foreground"
                                >
                                  <span>
                                    {item.quantity}x {item.product_name}
                                  </span>
                                  <span>{formatBRL(item.subtotal)}</span>
                                </div>
                              ))}
                              {items.length > 5 && (
                                <p className="text-xs text-muted-foreground">
                                  +{items.length - 5} mais itens...
                                </p>
                              )}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ============== Mesas (abertas pelo caixa) ============== */}
          <TabsContent value="mesas" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {filteredTables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <UtensilsCrossed className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">
                    {search ? "Nenhuma mesa encontrada" : "Nenhuma mesa ocupada"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTables.map((table) => {
                    const tableComandas = getComandasForTable(table);
                    const total = getTableTotal(table);
                    const allItems = tableComandas.flatMap((c) =>
                      getItemsByComanda(c.id),
                    );
                    return (
                      <HoverCard key={table.id} openDelay={300}>
                        <HoverCardTrigger asChild>
                          <Card
                            className="cursor-pointer hover:bg-accent/50 transition-colors group"
                            onClick={() => handleSelectTableCard(table)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        getTimeStatus(table.updated_at),
                                      )}
                                    />
                                    <span className="font-semibold">
                                      {formatTableLabel(table.table_number)}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {tableComandas.length}{" "}
                                      {tableComandas.length === 1 ? "comanda" : "comandas"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(table.updated_at), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <span className="text-lg font-bold text-primary group-hover:scale-105 transition-transform inline-block">
                                    {formatBRL(total)}
                                  </span>
                                  {onCancelTable && table.current_order_id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelTarget({ type: "table", id: table.id, orderId: table.current_order_id!, label: formatTableLabel(table.table_number) });
                                      }}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-64">
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              Itens da Mesa
                            </h4>
                            <div className="space-y-1 text-sm">
                              {allItems.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-muted-foreground"
                                >
                                  <span>
                                    {item.quantity}x {item.product_name}
                                  </span>
                                  <span>{formatBRL(item.subtotal)}</span>
                                </div>
                              ))}
                              {allItems.length > 5 && (
                                <p className="text-xs text-muted-foreground">
                                  +{allItems.length - 5} mais itens...
                                </p>
                              )}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason(""); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar {cancelTarget?.label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Todos os itens serão cancelados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Motivo do cancelamento (opcional)..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className="mt-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Confirmar Cancelamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
