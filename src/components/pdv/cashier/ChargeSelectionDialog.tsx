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
  onCancelComanda?: (comandaId: string) => void;
  onCancelTable?: (tableId: string, orderId: string) => void;
}

type SortOption = "time" | "value" | "number";

export function ChargeSelectionDialog({
  open,
  onOpenChange,
  onSelectComanda,
  onSelectTable,
  onCancelComanda,
  onCancelTable,
}: ChargeSelectionDialogProps) {
  const [tab, setTab] = useState<"pendentes" | "comandas" | "mesas">("pendentes");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("time");
  const [cancelTarget, setCancelTarget] = useState<{ type: "comanda" | "table"; id: string; orderId?: string; label: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  
  const { comandas, getItemsByComanda, getStandaloneComandas, getPendingPaymentComandas } = usePDVComandas();
  const { tables } = usePDVTables();

  // Comandas vindas do garçom aguardando cobrança (mesa ou avulsas)
  const pendingComandas = getPendingPaymentComandas();

  // Get standalone comandas (no table/order) - apenas abertas pelo caixa
  const standaloneComandas = getStandaloneComandas();

  // Get occupied tables with comandas
  const occupiedTables = tables.filter(
    (t) => t.status !== "livre" && t.current_order_id
  );

  // Get comandas for a table
  const getComandasForTable = (table: PDVTable) => {
    if (!table.current_order_id) return [];
    return comandas.filter(
      (c) => c.order_id === table.current_order_id && c.status === "aberta"
    );
  };

  // Get table total
  const getTableTotal = (table: PDVTable) => {
    const tableComandas = getComandasForTable(table);
    return tableComandas.reduce((sum, c) => sum + c.subtotal, 0);
  };

  // Get wait time status color
  const getTimeStatus = (createdAt: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(createdAt));
    if (minutes < 30) return "bg-green-500";
    if (minutes < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filter and sort comandas
  const filteredComandas = useMemo(() => {
    let result = standaloneComandas.filter((c) => {
      const searchLower = search.toLowerCase();
      return (
        c.comanda_number.toLowerCase().includes(searchLower) ||
        c.customer_name?.toLowerCase().includes(searchLower)
      );
    });

    switch (sortBy) {
      case "time":
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
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

  // Filter and sort tables
  const filteredTables = useMemo(() => {
    let result = occupiedTables.filter((t) => {
      const searchLower = search.toLowerCase();
      return t.table_number.toLowerCase().includes(searchLower);
    });

    switch (sortBy) {
      case "time":
        result.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
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

  const handleSelectComanda = (comanda: Comanda) => {
    const items = getItemsByComanda(comanda.id);
    onSelectComanda(comanda, items);
  };

  const handleSelectTable = (table: PDVTable) => {
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Selecionar para Cobrança
          </DialogTitle>
          <DialogDescription>
            Escolha uma comanda avulsa ou mesa para iniciar o pagamento.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
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
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "comandas" | "mesas")}>
          <TabsList className="grid w-full grid-cols-2">
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

          <TabsContent value="comandas" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {filteredComandas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Receipt className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">
                    {search
                      ? "Nenhuma comanda encontrada"
                      : "Nenhuma comanda avulsa aberta"}
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
                            onClick={() => handleSelectComanda(comanda)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        getTimeStatus(comanda.created_at)
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
                                    {formatCurrency(comanda.subtotal)}
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
                                  <span>{formatCurrency(item.subtotal)}</span>
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

          <TabsContent value="mesas" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
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
                      getItemsByComanda(c.id)
                    );
                    return (
                      <HoverCard key={table.id} openDelay={300}>
                        <HoverCardTrigger asChild>
                          <Card
                            className="cursor-pointer hover:bg-accent/50 transition-colors group"
                            onClick={() => handleSelectTable(table)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        getTimeStatus(table.updated_at)
                                      )}
                                    />
                                    <span className="font-semibold">
                                      {formatTableLabel(table.table_number)}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {tableComandas.length}{" "}
                                      {tableComandas.length === 1
                                        ? "comanda"
                                        : "comandas"}
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
                                    {formatCurrency(total)}
                                  </span>
                                  {onCancelTable && table.current_order_id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelTarget({ type: "table", id: table.id, orderId: table.current_order_id!, label: `Mesa ${table.table_number}` });
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
                                  <span>{formatCurrency(item.subtotal)}</span>
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
