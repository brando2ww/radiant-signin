import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenants } from "@/hooks/use-tenants";
import { TenantCard } from "@/components/super-admin/TenantCard";

export default function Tenants() {
  const { tenants, isLoading } = useTenants();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.document && t.document.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as empresas cadastradas na plataforma
          </p>
        </div>
        <Button onClick={() => navigate("/admin/tenants/novo")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tenant
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou documento..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Nenhum tenant encontrado." : "Nenhum tenant cadastrado ainda."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TenantCard key={t.id} tenant={t} allTenants={tenants} />
          ))}
        </div>
      )}
    </div>
  );
}
