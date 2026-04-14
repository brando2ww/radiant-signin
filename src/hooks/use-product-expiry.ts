import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ExpiryStatus = Database["public"]["Enums"]["expiry_status"];

export interface ExpiryItem {
  id: string;
  product_name: string;
  batch_id: string | null;
  expiry_date: string;
  status: ExpiryStatus;
  notes: string | null;
  registered_by: string | null;
  created_at: string;
  daysLeft: number;
}

function computeStatus(expiryDate: string): ExpiryStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + "T00:00:00");
  const diff = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return "vencido";
  if (diff <= 3) return "proximo_vencimento";
  return "valido";
}

export function useExpiryItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["product-expiry", user?.id],
    queryFn: async (): Promise<ExpiryItem[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("product_expiry_tracking")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "descartado")
        .order("expiry_date", { ascending: true });
      if (error) throw error;

      return (data || []).map((item) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const exp = new Date(item.expiry_date + "T00:00:00");
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
        return { ...item, daysLeft, status: computeStatus(item.expiry_date) };
      });
    },
    enabled: !!user?.id,
  });
}

export function useExpiryHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["product-expiry-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("product_expiry_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "descartado")
        .order("updated_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useCreateExpiry() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (item: { product_name: string; batch_id?: string; expiry_date: string; notes?: string }) => {
      if (!user?.id) throw new Error("No user");
      const { error } = await supabase.from("product_expiry_tracking").insert({
        ...item,
        user_id: user.id,
        status: computeStatus(item.expiry_date),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-expiry"] }),
  });
}

export function useUpdateExpiryStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ExpiryStatus; notes?: string }) => {
      const update: any = { status };
      if (notes !== undefined) update.notes = notes;
      const { error } = await supabase.from("product_expiry_tracking").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-expiry"] });
      qc.invalidateQueries({ queryKey: ["product-expiry-history"] });
    },
  });
}

export function useDeleteExpiry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_expiry_tracking").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-expiry"] }),
  });
}
