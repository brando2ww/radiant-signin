import { useState } from "react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Users as UsersIcon } from "lucide-react";
import { UserCard } from "@/components/pdv/users/UserCard";
import { UserDialog } from "@/components/pdv/users/UserDialog";
import { usePDVUsers } from "@/hooks/use-pdv-users";
import { roleConfig } from "@/components/pdv/users/RolePermissionsView";

export default function Users() {
  const { users, isLoading, createUser, updateUser, toggleActive } = usePDVUsers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = users.filter((u: any) => {
    const matchesSearch =
      !search ||
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.is_active) ||
      (statusFilter === "inactive" && !u.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSave = (data: any) => {
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingUser(null);
        },
      });
    } else {
      createUser.mutate(data, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Usuários"
        description="Gerencie os colaboradores e suas permissões no sistema."
      >
        <Button
          onClick={() => {
            setEditingUser(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Convidar Usuário
        </Button>
      </ResponsivePageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            {Object.entries(roleConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {users.length === 0
              ? "Nenhum usuário cadastrado. Convide seu primeiro colaborador!"
              : "Nenhum usuário encontrado com os filtros selecionados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user: any) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onToggleActive={(id, isActive) => toggleActive.mutate({ id, is_active: isActive })}
            />
          ))}
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSave={handleSave}
        editingUser={editingUser}
        isLoading={createUser.isPending || updateUser.isPending}
      />
    </div>
  );
}
