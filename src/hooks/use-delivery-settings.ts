import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliveryZone {
  neighborhood: string;
  fee: number;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

export interface DeliverySettings {
  id: string;
  user_id: string;
  is_open: boolean;
  auto_accept_orders: boolean;
  min_order_value: number;
  default_delivery_fee: number;
  estimated_preparation_time: number;
  max_delivery_distance: number;
  accepts_pix: boolean;
  pix_key: string | null;
  accepts_credit: boolean;
  accepts_debit: boolean;
  accepts_cash: boolean;
  delivery_zones: DeliveryZone[];
  business_hours: BusinessHours;
  blocked_dates: string[];
  whatsapp_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export const useDeliverySettings = () => {
  return useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("delivery_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Parse JSON fields
      return {
        ...data,
        delivery_zones: (data.delivery_zones as any) || [],
        business_hours: (data.business_hours as any) || {},
        blocked_dates: (data.blocked_dates as any) || [],
      } as DeliverySettings;
    },
  });
};

export const useCreateOrUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      settings: Partial<DeliverySettings>
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("delivery_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("delivery_settings")
          .update(settings as any)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from("delivery_settings")
          .insert({ ...settings, user_id: user.id } as any)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar configurações: " + error.message);
    },
  });
};

export const useToggleStoreOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isOpen: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("delivery_settings")
        .update({ is_open: isOpen })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success(data.is_open ? "Loja aberta!" : "Loja fechada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao alterar status: " + error.message);
    },
  });
};
