import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Grid3x3 } from "lucide-react";
import { usePDVTables } from "@/hooks/use-pdv-tables";
import { usePDVOrders } from "@/hooks/use-pdv-orders";
import { TableCard } from "@/components/pdv/TableCard";
import { TableDialog } from "@/components/pdv/TableDialog";
import { TableDetailsDialog } from "@/components/pdv/TableDetailsDialog";
import { OrderDetailsDialog } from "@/components/pdv/OrderDetailsDialog";
import { SalonFilters } from "@/components/pdv/SalonFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PDVSalon() {
  const {
    tables,
    isLoading: isLoadingTables,
    createTable,
    isCreating,
    updateTable,
    isUpdating,
    deleteTable,
    isDeleting,
  } = usePDVTables();

  const {
    orders,
    orderItems,
    isLoading: isLoadingOrders,
    createOrder,
    updateItem,
    removeItem,
    addItem,
    closeOrder,
    cancelOrder,
  } = usePDVOrders();

  const [tableDialog, setTableDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tableDetailsOpen, setTableDetailsOpen] = useState(false);
  const [selectedTableForDetails, setSelectedTableForDetails] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtrar pedidos do salão
  const salonOrders = useMemo(() => {
    return orders.filter((o) => o.source === "salao");
  }, [orders]);

  // Contadores
  const { occupiedCount, availableCount } = useMemo(() => {
    const occupied = tables.filter((t) => t.status !== "livre").length;
    const available = tables.filter((t) => t.status === "livre").length;
    return { occupiedCount: occupied, availableCount: available };
  }, [tables]);

  // Mesas filtradas
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (statusFilter === "all") return true;
      return table.status === statusFilter;
    });
  }, [tables, statusFilter]);

  const getTableOrder = (tableId: string) => {
    return salonOrders.find(
      (o) => o.table_id === tableId && o.status === "aberta"
    );
  };

  const getOrderItems = (orderId: string) => {
    return orderItems.filter((item) => item.order_id === orderId);
  };

  const handleCreateTable = () => {
    setSelectedTable(null);
    setTableDialog(true);
  };

  const handleEditTable = (table: any) => {
    setSelectedTable(table);
    setTableDialog(true);
  };

  const handleSubmitTable = (data: any) => {
    if (selectedTable) {
      updateTable(
        { id: selectedTable.id, updates: data },
        {
          onSuccess: () => setTableDialog(false),
        }
      );
    } else {
      createTable(data, {
        onSuccess: () => setTableDialog(false),
      });
    }
  };

  const handleTableClick = (table: any) => {
    setSelectedTableForDetails(table);
    setTableDetailsOpen(true);
  };

  const handleCreateOrder = (tableId: string) => {
    createOrder(
      { source: "salao", table_id: tableId },
      {
        onSuccess: (order) => {
          updateTable({ id: tableId, updates: { status: "ocupada", current_order_id: order.id } });
        },
      }
    );
  };

  const handleViewOrder = (orderId: string) => {
    const order = salonOrders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setOrderDetailsOpen(true);
    }
  };

  const handleCloseTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table?.current_order_id) {
      closeOrder(table.current_order_id, {
        onSuccess: () => {
          updateTable({
            id: tableId,
            updates: { status: "livre", current_order_id: null },
          });
        },
      });
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<any>) => {
    updateItem({ id, updates });
  };

  const handleCloseOrder = (id: string) => {
    const order = salonOrders.find((o) => o.id === id);
    if (order?.table_id) {
      closeOrder(id, {
        onSuccess: () => {
          updateTable({
            id: order.table_id!,
            updates: { status: "livre", current_order_id: null },
          });
          setOrderDetailsOpen(false);
        },
      });
    }
  };

  const handleCancelOrder = (id: string, reason: string) => {
    const order = salonOrders.find((o) => o.id === id);
    cancelOrder(
      { id, reason },
      {
        onSuccess: () => {
          if (order?.table_id) {
            updateTable({
              id: order.table_id,
              updates: { status: "livre", current_order_id: null },
            });
          }
          setOrderDetailsOpen(false);
        },
      }
    );
  };

  if (isLoadingTables || isLoadingOrders) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salão</h1>
          <p className="text-muted-foreground">
            Gerencie suas mesas e atendimentos
          </p>
        </div>
        <Button onClick={handleCreateTable}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Mesa
        </Button>
      </div>

      <SalonFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalTables={tables.length}
        filteredCount={filteredTables.length}
        occupiedCount={occupiedCount}
        availableCount={availableCount}
      />

      {filteredTables.length === 0 ? (
        <Card>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Grid3x3 className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">
                  {tables.length === 0
                    ? "Nenhuma mesa cadastrada"
                    : "Nenhuma mesa encontrada"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tables.length === 0
                    ? "Comece adicionando suas primeiras mesas"
                    : "Ajuste os filtros para ver outras mesas"}
                </p>
              </div>
              {tables.length === 0 && (
                <Button onClick={handleCreateTable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Mesa
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const order = getTableOrder(table.id);
            return (
              <TableCard
                key={table.id}
                table={table}
                orderTotal={order?.total}
                orderTime={
                  order
                    ? format(parseISO(order.opened_at), "HH:mm", { locale: ptBR })
                    : undefined
                }
                onClick={handleTableClick}
              />
            );
          })}
        </div>
      )}

      <TableDialog
        open={tableDialog}
        onOpenChange={setTableDialog}
        table={selectedTable}
        onSubmit={handleSubmitTable}
        isSubmitting={isCreating || isUpdating}
      />

      <TableDetailsDialog
        open={tableDetailsOpen}
        onOpenChange={setTableDetailsOpen}
        table={selectedTableForDetails}
        orderTotal={
          selectedTableForDetails
            ? getTableOrder(selectedTableForDetails.id)?.total
            : undefined
        }
        orderTime={
          selectedTableForDetails
            ? getTableOrder(selectedTableForDetails.id)
              ? format(
                  parseISO(
                    getTableOrder(selectedTableForDetails.id)!.opened_at
                  ),
                  "HH:mm",
                  { locale: ptBR }
                )
              : undefined
            : undefined
        }
        onCreateOrder={handleCreateOrder}
        onViewOrder={handleViewOrder}
        onCloseTable={handleCloseTable}
        onEditTable={handleEditTable}
        onDeleteTable={deleteTable}
      />

      <OrderDetailsDialog
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        order={selectedOrder}
        items={selectedOrder ? getOrderItems(selectedOrder.id) : []}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={removeItem}
        onAddItem={addItem}
        onClose={handleCloseOrder}
        onCancel={handleCancelOrder}
      />
    </div>
  );
}
