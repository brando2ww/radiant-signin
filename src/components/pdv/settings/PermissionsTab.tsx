import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  usePDVPermissions,
  ALL_PDV_ACTIONS,
  PDV_ACTION_LABEL,
  type PDVPermissionAction,
} from "@/hooks/use-pdv-permissions";
import type { AppRole } from "@/hooks/use-user-role";

const ROLES: { role: AppRole; label: string }[] = [
  { role: "gerente", label: "Gerente" },
  { role: "caixa", label: "Caixa" },
  { role: "garcom", label: "Garçom" },
];

// Garçom nunca pode receber estas ações
const WAITER_FORBIDDEN: PDVPermissionAction[] = [
  "process_payment",
  "refund_payment",
  "remove_service_fee",
  "cancel_paid_item",
];

export function PermissionsTab() {
  const { permissions, can: _can, upsertPermission, isUpdating } = usePDVPermissions();

  const matrix = useMemo(() => {
    const map = new Map<string, boolean>();
    permissions.forEach((p) => map.set(`${p.role}:${p.action}`, p.allowed));
    return map;
  }, [permissions]);

  const isAllowed = (role: AppRole, action: PDVPermissionAction): boolean => {
    const explicit = matrix.get(`${role}:${action}`);
    if (explicit !== undefined) return explicit;
    // defaults espelhados
    if (role === "garcom" && WAITER_FORBIDDEN.includes(action)) return false;
    if (role === "gerente") return true;
    if (role === "caixa") return action !== "close_attendance" ? true : true;
    if (role === "garcom") {
      return [
        "change_table",
        "transfer_table_to_table",
        "transfer_comanda_to_comanda",
        "transfer_table_to_comanda",
        "transfer_comanda_to_table",
        "close_attendance",
        "cancel_item",
        "view_history",
      ].includes(action);
    }
    return false;
  };

  const handleToggle = (role: AppRole, action: PDVPermissionAction, allowed: boolean) => {
    if (role === "garcom" && WAITER_FORBIDDEN.includes(action) && allowed) return;
    upsertPermission({ role, action, allowed });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões por perfil</CardTitle>
        <CardDescription>
          Configure quais ações cada perfil pode executar no Salão, Mesas, Comandas e Caixa.
          Pagamentos, estornos, remoção de taxa e cancelamento de item já pago são bloqueados para
          garçons por segurança.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Ação</th>
                {ROLES.map((r) => (
                  <th key={r.role} className="text-center py-2 px-2 font-medium">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PDV_ACTIONS.map((action) => (
                <tr key={action} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    {PDV_ACTION_LABEL[action]}
                  </td>
                  {ROLES.map(({ role }) => {
                    const forbidden = role === "garcom" && WAITER_FORBIDDEN.includes(action);
                    const allowed = isAllowed(role, action);
                    return (
                      <td key={role} className="text-center py-2 px-2">
                        {forbidden ? (
                          <Badge variant="outline" className="text-xs">Bloqueado</Badge>
                        ) : (
                          <Switch
                            checked={allowed}
                            disabled={isUpdating}
                            onCheckedChange={(v) => handleToggle(role, action, v)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
