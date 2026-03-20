import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useTenants, Tenant, TenantModule } from "@/hooks/use-tenants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleLabels: Record<string, string> = {
  proprietario: "Proprietário",
  gerente: "Gerente",
  caixa: "Caixa",
  garcom: "Garçom",
  cozinheiro: "Cozinheiro",
  estoquista: "Estoquista",
  financeiro: "Financeiro",
  atendente_delivery: "Atendente Delivery",
};

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenants, fetchTenantModules, fetchTenantUsers } = useTenants();

  const [modules, setModules] = useState<TenantModule[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tenant = tenants.find((t) => t.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchTenantModules(id), fetchTenantUsers(id)])
      .then(([mods, usrs]) => {
        setModules(mods);
        setUsers(usrs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (!tenant) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tenant não encontrado.
        <br />
        <Button variant="link" onClick={() => navigate("/admin/tenants")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tenants")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <p className="text-sm text-muted-foreground">
            {tenant.document || "Sem documento"} ·{" "}
            <Badge variant={tenant.is_active ? "default" : "secondary"} className="ml-1">
              {tenant.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Módulos Habilitados</CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum módulo habilitado.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {modules.map((m) => (
                    <Badge key={m.id} variant={m.is_active ? "default" : "outline"}>
                      {m.module}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuários ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium">{u.display_name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {roleLabels[u.role] || u.role}
                        </Badge>
                        <Badge variant={u.is_active ? "default" : "secondary"}>
                          {u.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p>
                Criado em:{" "}
                {format(new Date(tenant.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              <p>
                Atualizado em:{" "}
                {format(new Date(tenant.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
