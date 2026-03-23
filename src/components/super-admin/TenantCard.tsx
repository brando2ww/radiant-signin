import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ChevronRight, GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tenant } from "@/hooks/use-tenants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TenantCardProps {
  tenant: Tenant;
  allTenants?: Tenant[];
}

export function TenantCard({ tenant, allTenants = [] }: TenantCardProps) {
  const navigate = useNavigate();
  const parentName = tenant.parent_tenant_id
    ? allTenants.find((t) => t.id === tenant.parent_tenant_id)?.name
    : null;
  const hasChildren = allTenants.some((t) => t.parent_tenant_id === tenant.id);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {hasChildren ? (
              <GitBranch className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium">{tenant.name}</p>
            <p className="text-xs text-muted-foreground">
              {tenant.document || "Sem documento"} · Criado em{" "}
              {format(new Date(tenant.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChildren && (
            <Badge variant="outline" className="text-xs">Matriz</Badge>
          )}
          {parentName && (
            <Badge variant="outline" className="text-xs">Franquia</Badge>
          )}
          <Badge variant={tenant.is_active ? "default" : "secondary"}>
            {tenant.is_active ? "Ativo" : "Inativo"}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
