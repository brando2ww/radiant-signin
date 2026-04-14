import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useChecklistOperators } from "@/hooks/use-checklist-operators";
import { TeamIndicators } from "./team/TeamIndicators";
import { TeamFilters, type TeamFilterState } from "./team/TeamFilters";
import { OperatorCard } from "./team/OperatorCard";
import { OperatorDrawer } from "./team/OperatorDrawer";
import { OperatorProfileDrawer } from "./team/OperatorProfileDrawer";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];

export function OperatorsManager() {
  const { operators, isLoading, deleteOperator } = useChecklistOperators();

  const [filters, setFilters] = useState<TeamFilterState>({
    search: "", sector: "all", access: "all", status: "all", sort: "name",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileOp, setProfileOp] = useState<OperatorRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...operators];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((o) => o.name.toLowerCase().includes(q));
    }
    if (filters.sector !== "all") list = list.filter((o) => o.sector === filters.sector);
    if (filters.access !== "all") list = list.filter((o) => o.access_level === filters.access);
    if (filters.status === "active") list = list.filter((o) => o.is_active);
    if (filters.status === "inactive") list = list.filter((o) => !o.is_active);

    list.sort((a, b) => {
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      if (filters.sort === "sector") return a.sector.localeCompare(b.sector);
      if (filters.sort === "access") return a.access_level.localeCompare(b.access_level);
      return 0;
    });

    return list;
  }, [operators, filters]);

  const openCreate = () => { setEditingId(null); setDrawerOpen(true); };
  const openEdit = (id: string) => { setEditingId(id); setDrawerOpen(true); };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <TeamIndicators operators={operators} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TeamFilters filters={filters} onChange={setFilters} />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Novo Colaborador
        </Button>
      </div>

      {operators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum colaborador cadastrado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Cadastre o primeiro colaborador para começar a atribuir checklists.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Cadastrar Colaborador
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum colaborador encontrado com os filtros aplicados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((op) => (
            <OperatorCard key={op.id} operator={op} onClick={() => setProfileOp(op)} />
          ))}
        </div>
      )}

      <OperatorDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editingId={editingId}
        operators={operators}
      />

      <OperatorProfileDrawer
        open={!!profileOp}
        onOpenChange={(open) => { if (!open) setProfileOp(null); }}
        operator={profileOp}
        onEdit={() => {
          if (profileOp) {
            setProfileOp(null);
            openEdit(profileOp.id);
          }
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover colaborador?</AlertDialogTitle>
            <AlertDialogDescription>O colaborador será removido dos agendamentos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteOperator(deleteId); setDeleteId(null); }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
