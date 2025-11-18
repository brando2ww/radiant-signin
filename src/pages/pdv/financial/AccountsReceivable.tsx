import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBills } from "@/hooks/use-bills";
import { BillDialog } from "@/components/bills/BillDialog";
import { BillFilters } from "@/components/bills/BillFilters";
import { BillCard } from "@/components/bills/BillCard";
import { BillStats } from "@/components/bills/BillStats";
import { MarkAsPaidDialog } from "@/components/bills/MarkAsPaidDialog";
import type { Bill } from "@/hooks/use-bills";

export default function AccountsReceivable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
  });

  const billFilters = {
    type: "receivable" as const,
    ...(filters.search && { search: filters.search }),
    ...(filters.status !== "all" && { status: filters.status as any }),
    ...(filters.category !== "all" && { category: filters.category }),
  };

  const { bills, stats, isLoading, createBill, updateBill, deleteBill, markAsPaid } = useBills(billFilters);

  const handleSave = async (data: any) => {
    if (selectedBill) {
      await updateBill({ ...data, id: selectedBill.id });
    } else {
      await createBill(data);
    }
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      await deleteBill(id);
    }
  };

  const handleMarkAsPaid = (bill: Bill) => {
    setSelectedBill(bill);
    setMarkAsPaidDialogOpen(true);
  };

  const handleMarkAsPaidConfirm = async (data: any) => {
    if (selectedBill) {
      await markAsPaid({ id: selectedBill.id, ...data });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas receitas e recebimentos
          </p>
        </div>
        <Button onClick={() => { setSelectedBill(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      <BillStats
        totalPayable={stats?.totalPayable || 0}
        totalReceivable={stats?.totalReceivable || 0}
        overdue={stats?.overdue || 0}
        type="receivable"
      />

      <BillFilters
        type="receivable"
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando...
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma conta a receber encontrada</p>
            <p className="text-sm mt-2">Clique em "Nova Receita" para adicionar</p>
          </div>
        ) : (
          bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkAsPaid={handleMarkAsPaid}
            />
          ))
        )}
      </div>

      <BillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bill={selectedBill}
        onSave={handleSave}
        type="receivable"
      />

      <MarkAsPaidDialog
        open={markAsPaidDialogOpen}
        onOpenChange={setMarkAsPaidDialogOpen}
        bill={selectedBill}
        onConfirm={handleMarkAsPaidConfirm}
      />
    </div>
  );
}
