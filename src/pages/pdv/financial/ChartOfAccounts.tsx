import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderTree, Pencil, Trash2, Search, Sparkles, ChevronRight, ChevronDown } from "lucide-react";
import { usePDVChartOfAccounts, type PDVChartOfAccount } from "@/hooks/use-pdv-chart-of-accounts";

const ACCOUNT_TYPES = [
  { value: "receita", label: "Receita", color: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "despesa", label: "Despesa", color: "text-destructive", badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  { value: "custo", label: "Custo (CMV)", color: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
];

function getTypeConfig(type: string) {
  return ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];
}

interface AccountFormData {
  code: string;
  name: string;
  account_type: string;
  parent_id: string | null;
}

const emptyForm: AccountFormData = { code: "", name: "", account_type: "receita", parent_id: null };

export default function ChartOfAccounts() {
  const { accounts, isLoading, createAccount, updateAccount, deleteAccount, seedBasicStructure } = usePDVChartOfAccounts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PDVChartOfAccount | null>(null);
  const [form, setForm] = useState<AccountFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PDVChartOfAccount | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["receita", "despesa", "custo"]));

  const filtered = useMemo(() => {
    let list = accounts;
    if (filterType !== "all") list = list.filter(a => a.account_type === filterType);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(s) || a.code.toLowerCase().includes(s));
    }
    return list;
  }, [accounts, filterType, search]);

  const grouped = useMemo(() => {
    const map: Record<string, PDVChartOfAccount[]> = {};
    for (const type of ACCOUNT_TYPES) {
      map[type.value] = filtered.filter(a => a.account_type === type.value);
    }
    return map;
  }, [filtered]);

  const countByType = useMemo(() => {
    const map: Record<string, number> = { receita: 0, despesa: 0, custo: 0 };
    for (const a of accounts) {
      if (map[a.account_type] !== undefined) map[a.account_type]++;
    }
    return map;
  }, [accounts]);

  const openCreate = () => {
    setEditingAccount(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (account: PDVChartOfAccount) => {
    setEditingAccount(account);
    setForm({ code: account.code, name: account.name, account_type: account.account_type, parent_id: account.parent_id });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, code: form.code, name: form.name, account_type: form.account_type, parent_id: form.parent_id });
    } else {
      createAccount.mutate(form);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAccount.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const parentOptions = accounts.filter(a => !editingAccount || a.id !== editingAccount.id);

  const buildTree = (list: PDVChartOfAccount[]) => {
    const roots = list.filter(a => !a.parent_id || !list.find(p => p.id === a.parent_id));
    const children = (parentId: string) => list.filter(a => a.parent_id === parentId);
    return { roots, children };
  };

  const renderAccountRow = (account: PDVChartOfAccount, indent: number, childrenFn: (id: string) => PDVChartOfAccount[]) => {
    const kids = childrenFn(account.id);
    const typeConfig = getTypeConfig(account.account_type);
    return (
      <div key={account.id}>
        <div className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-muted/50 transition-colors group" style={{ paddingLeft: `${12 + indent * 24}px` }}>
          <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">{account.code}</span>
          <span className="flex-1 text-sm font-medium">{account.name}</span>
          <Badge variant="outline" className={`text-xs ${typeConfig.badge}`}>
            {typeConfig.label}
          </Badge>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(account)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(account)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {kids.map(child => renderAccountRow(child, indent + 1, childrenFn))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plano de Contas</h1>
          <p className="text-muted-foreground mt-1">Estrutura hierárquica de categorias contábeis</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 && (
            <Button variant="outline" onClick={() => seedBasicStructure.mutate()} disabled={seedBasicStructure.isPending}>
              <Sparkles className="mr-2 h-4 w-4" />
              Criar Estrutura Básica
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ACCOUNT_TYPES.map(type => (
          <Card key={type.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FolderTree className={`h-5 w-5 ${type.color}`} />
                <span className="text-2xl font-bold">{countByType[type.value]}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">contas cadastradas</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Estrutura de Contas</CardTitle>
              <CardDescription>Visualização hierárquica do plano de contas</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar conta..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {ACCOUNT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conta cadastrada ainda</p>
              <p className="text-sm mt-2">Configure seu plano de contas para categorizar transações</p>
              {accounts.length === 0 && (
                <Button variant="outline" className="mt-4" onClick={() => seedBasicStructure.mutate()} disabled={seedBasicStructure.isPending}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Criar Estrutura Básica
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {ACCOUNT_TYPES.filter(type => filterType === "all" || filterType === type.value).map(type => {
                const typeAccounts = grouped[type.value] || [];
                if (typeAccounts.length === 0) return null;
                const isExpanded = expandedTypes.has(type.value);
                const { roots, children } = buildTree(typeAccounts);
                return (
                  <div key={type.value} className="py-2">
                    <button onClick={() => toggleType(type.value)} className="flex items-center gap-2 w-full py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <FolderTree className={`h-4 w-4 ${type.color}`} />
                      <span className="font-semibold text-sm">{type.label}</span>
                      <Badge variant="secondary" className="text-xs ml-1">{typeAccounts.length}</Badge>
                    </button>
                    {isExpanded && (
                      <div className="ml-2">
                        {roots.map(account => renderAccountRow(account, 0, children))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Editar Conta" : "Nova Conta"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "Altere os dados da conta contábil" : "Preencha os dados da nova conta contábil"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input placeholder="Ex: 1.01" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.account_type} onValueChange={v => setForm(f => ({ ...f, account_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Nome da conta" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Conta Pai (opcional)</Label>
              <Select value={form.parent_id || "none"} onValueChange={v => setForm(f => ({ ...f, parent_id: v === "none" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (raiz)</SelectItem>
                  {parentOptions.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.code.trim() || !form.name.trim() || createAccount.isPending || updateAccount.isPending}>
              {editingAccount ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta <strong>{deleteTarget?.code} - {deleteTarget?.name}</strong>? Esta ação pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
