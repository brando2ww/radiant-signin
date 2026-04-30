import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { useUserRole, type AppRole } from "@/hooks/use-user-role";
import { toast } from "sonner";

export type PDVPermissionAction =
  | "change_table"
  | "transfer_table_to_table"
  | "transfer_comanda_to_comanda"
  | "transfer_table_to_comanda"
  | "transfer_comanda_to_table"
  | "close_attendance"
  | "cancel_item"
  | "cancel_paid_item"
  | "apply_discount"
  | "remove_service_fee"
  | "view_history"
  | "process_payment"
  | "refund_payment";

export interface PDVActionPermission {
  id: string;
  owner_user_id: string;
  role: AppRole;
  action: PDVPermissionAction;
  allowed: boolean;
  requires_reason: boolean;
}

export const ALL_PDV_ACTIONS: PDVPermissionAction[] = [
  "change_table",
  "transfer_table_to_table",
  "transfer_comanda_to_comanda",
  "transfer_table_to_comanda",
  "transfer_comanda_to_table",
  "close_attendance",
  "cancel_item",
  "cancel_paid_item",
  "apply_discount",
  "remove_service_fee",
  "view_history",
  "process_payment",
  "refund_payment",
];

export const PDV_ACTION_LABEL: Record<PDVPermissionAction, string> = {
  change_table: "Trocar mesa",
  transfer_table_to_table: "Transferir mesa → mesa",
  transfer_comanda_to_comanda: "Transferir comanda → comanda",
  transfer_table_to_comanda: "Transferir mesa → comanda",
  transfer_comanda_to_table: "Transferir comanda → mesa",
  close_attendance: "Encerrar atendimento (pedir conta)",
  cancel_item: "Cancelar item",
  cancel_paid_item: "Cancelar item já pago",
  apply_discount: "Aplicar desconto",
  remove_service_fee: "Remover taxa de serviço",
  view_history: "Visualizar histórico",
  process_payment: "Processar pagamento",
  refund_payment: "Estornar pagamento",
};

// Defaults espelhando a função has_pdv_action no banco
function defaultAllowed(role: AppRole, action: PDVPermissionAction): boolean {
  if (role === "garcom" && (action === "process_payment" || action === "refund_payment" || action === "remove_service_fee" || action === "cancel_paid_item")) {
    return false;
  }
  if (role === "proprietario" || role === "gerente") return true;
  if (role === "caixa") {
    return [
      "change_table",
      "transfer_table_to_table",
      "transfer_comanda_to_comanda",
      "transfer_table_to_comanda",
      "transfer_comanda_to_table",
      "close_attendance",
      "cancel_item",
      "cancel_paid_item",
      "apply_discount",
      "remove_service_fee",
      "view_history",
      "process_payment",
      "refund_payment",
    ].includes(action);
  }
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
}

export function usePDVPermissions() {
  const { user } = useAuth();
  const { establishmentOwnerId } = useEstablishmentId();
  const { role } = useUserRole();
  const queryClient = useQueryClient();
  const ownerId = establishmentOwnerId || user?.id || null;

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["pdv-action-permissions", ownerId],
    queryFn: async (): Promise<PDVActionPermission[]> => {
      if (!ownerId) return [];
      const { data, error } = await supabase
        .from("pdv_action_permissions")
        .select("*")
        .eq("owner_user_id", ownerId);
      if (error) throw error;
      return (data || []) as PDVActionPermission[];
    },
    enabled: !!ownerId,
  });

  const can = (action: PDVPermissionAction): boolean => {
    const explicit = rows.find((r) => r.role === role && r.action === action);
    if (explicit) return explicit.allowed;
    return defaultAllowed(role, action);
  };

  const requiresReason = (action: PDVPermissionAction): boolean => {
    const explicit = rows.find((r) => r.role === role && r.action === action);
    return explicit?.requires_reason ?? false;
  };

  const upsertMutation = useMutation({
    mutationFn: async (input: {
      role: AppRole;
      action: PDVPermissionAction;
      allowed: boolean;
      requires_reason?: boolean;
    }) => {
      if (!ownerId) throw new Error("Sem estabelecimento");
      const { error } = await supabase
        .from("pdv_action_permissions")
        .upsert(
          {
            owner_user_id: ownerId,
            role: input.role,
            action: input.action,
            allowed: input.allowed,
            requires_reason: input.requires_reason ?? false,
          },
          { onConflict: "owner_user_id,role,action" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-action-permissions", ownerId] });
      toast.success("Permissão atualizada");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  return {
    permissions: rows,
    isLoading,
    can,
    requiresReason,
    upsertPermission: upsertMutation.mutate,
    isUpdating: upsertMutation.isPending,
    role,
  };
}
