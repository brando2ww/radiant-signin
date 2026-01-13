import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt, UtensilsCrossed, Clock, User } from "lucide-react";
import { usePDVComandas, Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";
import { usePDVTables, PDVTable } from "@/hooks/use-pdv-tables";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChargeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComanda: (comanda: Comanda, items: ComandaItem[]) => void;
  onSelectTable: (table: PDVTable, comandas: Comanda[], items: ComandaItem[]) => void;
}

export function ChargeSelectionDialog({
  open,
  onOpenChange,
  onSelectComanda,
  onSelectTable,
}: ChargeSelectionDialogProps) {
  const [tab, setTab] = useState<"comandas" | "mesas">("comandas");
  const { comandas, comandaItems, getItemsByComanda, getStandaloneComandas } = usePDVComandas();
  const { tables } = usePDVTables();

  // Comandas avulsas abertas (sem mesa/order)
  const standaloneComandas = getStandaloneComandas();

  // Mesas ocupadas com suas comandas
  const occupiedTables = tables.filter(
    (t) => t.status !== "livre" && t.current_order_id
  );

  // Pegar comandas de uma mesa (através do order_id)
  const getComandasForTable = (table: PDVTable) => {
    if (!table.current_order_id) return [];
    return comandas.filter(
      (c) => c.order_id === table.current_order_id && c.status === "aberta"
    );
  };

  // Total de uma mesa
  const getTableTotal = (table: PDVTable) => {
    const tableComandas = getComandasForTable(table);
    return tableComandas.reduce((sum, c) => sum + c.subtotal, 0);
  };

  // Formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSelectComanda = (comanda: Comanda) => {
    const items = getItemsByComanda(comanda.id);
    onSelectComanda(comanda, items);
  };

  const handleSelectTable = (table: PDVTable) => {
    const tableComandas = getComandasForTable(table);
    const allItems = tableComandas.flatMap((c) => getItemsByComanda(c.id));
    onSelectTable(table, tableComandas, allItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Selecionar para Cobrança
          </DialogTitle>
          <DialogDescription>
            Escolha uma comanda avulsa ou mesa para iniciar o pagamento.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "comandas" | "mesas")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comandas" className="gap-2">
              <Receipt className="h-4 w-4" />
              Comandas
              {standaloneComandas.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {standaloneComandas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mesas" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Mesas
              {occupiedTables.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {occupiedTables.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comandas" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              {standaloneComandas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Receipt className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma comanda avulsa aberta</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {standaloneComandas.map((comanda) => {
                    const items = getItemsByComanda(comanda.id);
                    return (
                      <Card
                        key={comanda.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleSelectComanda(comanda)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
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
                            <div className="text-right">
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(comanda.subtotal)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mesas" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              {occupiedTables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <UtensilsCrossed className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma mesa ocupada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {occupiedTables.map((table) => {
                    const tableComandas = getComandasForTable(table);
                    const total = getTableTotal(table);
                    return (
                      <Card
                        key={table.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleSelectTable(table)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  Mesa {table.table_number}
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
                            <div className="text-right">
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(total)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
