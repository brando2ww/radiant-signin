import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVSettings {
  id: string;
  user_id: string;
  salon_layout: any;
  shifts: any[];
  auto_print_to_kitchen: boolean;
  require_customer_identification: boolean;
  enable_service_fee: boolean;
  service_fee_percentage: number;
  requires_opening_balance: boolean;
  allow_negative_balance: boolean;
  integrate_with_delivery: boolean;
  created_at: string;
  updated_at: string;
  // Novos campos
  business_name?: string;
  business_phone?: string;
  business_address?: string;
  business_cnpj?: string;
  state_registration?: string;
  tax_regime?: string;
  business_hours?: any;
  default_preparation_time?: number;
  accept_tips?: boolean;
  min_order_value?: number;
  max_tables_per_order?: number;
  accepted_payment_methods?: any;
  delivery_fee?: number;
  enable_multiple_payments?: boolean;
  printers?: any;
  enable_sound_notifications?: boolean;
  new_order_sound?: string;
  order_ready_sound?: string;
  enable_desktop_notifications?: boolean;
  nfe_auto_import_enabled?: boolean;
  nfe_auto_import_cnpj?: string;
}

export function usePDVSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["pdv-settings", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as PDVSettings | null;
    },
    enabled: !!user,
  });

  const createOrUpdateSettings = useMutation({
    mutationFn: async (updates: Partial<PDVSettings>) => {
      if (!user) throw new Error("Usuário não autenticado");

      if (settings) {
        const { data, error } = await supabase
          .from("pdv_settings")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("pdv_settings")
          .insert({ ...updates, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-settings"] });
      toast.success("Configurações atualizadas com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar configurações: " + error.message);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: createOrUpdateSettings.mutate,
    isUpdating: createOrUpdateSettings.isPending,
  };
}
