import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Package } from "lucide-react";
import { useExpiryItems, useCreateExpiry, useUpdateExpiry, useDiscardExpiry, useDeleteExpiry, useExpiryLossSummary } from "@/hooks/use-product-expiry";
import { toast } from "@/hooks/use-toast";
import { ExpiryAlertBlock } from "./expiry/ExpiryAlertBlock";
import { ExpiryOverview } from "./expiry/ExpiryOverview";
import { ExpiryFilters, type ExpiryFilterState } from "./expiry/ExpiryFilters";
import { ExpiryTable } from "./expiry/ExpiryTable";
import { ExpiryDrawer } from "./expiry/ExpiryDrawer";
import { DiscardDialog } from "./expiry/DiscardDialog";
import { ExpiryLossHistory } from "./expiry/ExpiryLossHistory";
import { FrequentProducts } from "./expiry/FrequentProducts";
import type { ExpiryItem } from "@/hooks/use-product-expiry";

export function ExpiryTrackingPanel() {
  const { data: items, isLoading } = useExpiryItems();
  const { data: lossSummary } = useExpiryLossSummary();
  const createMutation = useCreateExpiry();
  const updateMutation = useUpdateExpiry();
  const discardMutation = useDiscardExpiry();
  const deleteMutation = useDeleteExpiry();

  const [filters, setFilters] = useState<ExpiryFilterState>({
    search: "",
    category: "all",
    storageLocation: "all",
    status: "all",
    viewMode: "table",
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpiryItem | null>(null);
  const [prefill, setPrefill] = useState<{ product_name: string; category: string } | null>(null);
  const [discardId, setDiscardId] = useState<string | null>(null);
  const discardItem = (items || []).find((i) => i.id === discardId);

  // Filter items
  const filtered = (items || []).filter((item) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!item.product_name.toLowerCase().includes(s) && !(item.batch_id || "").toLowerCase().includes(s)) return false;
    }
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.storageLocation !== "all" && item.storage_location !== filters.storageLocation) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    return true;
  });

  const handleSave = async (data: any) => {
    try {
      if (data.id) {
        const { id, ...fields } = data;
        await updateMutation.mutateAsync({ id, ...fields });
        toast({ title: "Produto atualizado ✅" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Produto registrado ✅" });
      }
      setEditItem(null);
      setPrefill(null);
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDiscard = async (data: { discard_reason: string; discarded_quantity?: number; notes?: string }) => {
    if (!discardId) return;
    try {
      await discardMutation.mutateAsync({ id: discardId, ...data });
      toast({ title: "Produto descartado" });
      setDiscardId(null);
    } catch {
      toast({ title: "Erro ao descartar", variant: "destructive" });
    }
  };

  const handleUseToday = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, notes: "Marcado para uso imediato" });
      toast({ title: "Marcado para uso hoje" });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleDuplicate = (item: ExpiryItem) => {
    setPrefill({ product_name: item.product_name, category: item.category || "outros" });
    setEditItem(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: ExpiryItem) => {
    setEditItem(item);
    setPrefill(null);
    setDrawerOpen(true);
  };

  const handleQuickAdd = (p: { product_name: string; category: string }) => {
    setPrefill(p);
    setEditItem(null);
    setDrawerOpen(true);
  };

  const allItems = items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Controle de Validade</h2>
        <Button size="sm" onClick={() => { setEditItem(null); setPrefill(null); setDrawerOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Registrar Produto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : allItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum produto cadastrado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              O controle de validade começa assim que você registrar os primeiros produtos.
            </p>
            <Button className="mt-4" onClick={() => setDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />Registrar Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <ExpiryAlertBlock items={allItems} onDiscard={setDiscardId} onUseToday={handleUseToday} />
          <ExpiryOverview items={allItems} lossCount={lossSummary?.count || 0} lossValue={lossSummary?.totalValue || 0} />

          <Tabs defaultValue="ativos" className="space-y-3">
            <TabsList>
              <TabsTrigger value="ativos">Produtos Ativos</TabsTrigger>
              <TabsTrigger value="perdas">Histórico de Perdas</TabsTrigger>
            </TabsList>

            <TabsContent value="ativos" className="space-y-3">
              <ExpiryFilters filters={filters} onChange={setFilters} />
              <FrequentProducts onSelect={handleQuickAdd} />
              <Card>
                <CardContent className="p-0">
                  <ExpiryTable
                    items={filtered}
                    onEdit={handleEdit}
                    onDiscard={setDiscardId}
                    onDuplicate={handleDuplicate}
                    onDelete={(id) => {
                      deleteMutation.mutate(id);
                      toast({ title: "Produto excluído" });
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perdas">
              <ExpiryLossHistory />
            </TabsContent>
          </Tabs>
        </>
      )}

      <ExpiryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editItem={editItem}
        prefill={prefill}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DiscardDialog
        open={!!discardId}
        onOpenChange={(v) => { if (!v) setDiscardId(null); }}
        onConfirm={handleDiscard}
        isPending={discardMutation.isPending}
        productName={discardItem?.product_name}
      />
    </div>
  );
}
