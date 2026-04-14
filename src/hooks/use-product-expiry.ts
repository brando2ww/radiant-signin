import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ExpiryItem {
  id: string;
  product_name: string;
  batch_id: string | null;
  expiry_date: string;
  status: string;
  notes: string | null;
  registered_by: string | null;
  created_at: string;
  daysLeft: number;
  category: string | null;
  storage_location: string | null;
  quantity: number | null;
  unit: string | null;
  unit_cost: number | null;
  temperature: number | null;
  origin: string | null;
  discard_reason: string | null;
  discarded_quantity: number | null;
  discarded_at: string | null;
}

function computeStatus(expiryDate: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + "T00:00:00");
  const diff = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return "vencido";
  if (diff <= 1) return "critico";
  if (diff <= 3) return "proximo_vencimento";
  return "valido";
}

function computeDaysLeft(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + "T00:00:00");
  return Math.ceil((exp.getTime() - now.getTime()) / 86400000);
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
      return (data || []).map((item: any) => ({
        ...item,
        daysLeft: computeDaysLeft(item.expiry_date),
        status: computeStatus(item.expiry_date),
      }));
    },
    enabled: !!user?.id,
  });
}

export function useExpiryHistory(period?: { from: string; to: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["product-expiry-history", user?.id, period],
    queryFn: async (): Promise<ExpiryItem[]> => {
      if (!user?.id) return [];
      let q = supabase
        .from("product_expiry_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "descartado")
        .order("updated_at", { ascending: false });
      if (period?.from) q = q.gte("discarded_at", period.from);
      if (period?.to) q = q.lte("discarded_at", period.to + "T23:59:59");
      const { data } = await q.limit(200);
      return (data || []).map((item: any) => ({
        ...item,
        daysLeft: computeDaysLeft(item.expiry_date),
      }));
    },
    enabled: !!user?.id,
  });
}

export function useCreateExpiry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      product_name: string;
      batch_id?: string;
      expiry_date: string;
      notes?: string;
      category?: string;
      storage_location?: string;
      quantity?: number;
      unit?: string;
      unit_cost?: number;
      temperature?: number;
    }) => {
      if (!user?.id) throw new Error("No user");
      const { error } = await supabase.from("product_expiry_tracking").insert({
        ...item,
        user_id: user.id,
        status: computeStatus(item.expiry_date),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-expiry"] }),
  });
}

export function useUpdateExpiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: { id: string } & Record<string, any>) => {
      if (fields.expiry_date) {
        fields.status = computeStatus(fields.expiry_date);
      }
      const { error } = await supabase.from("product_expiry_tracking").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-expiry"] }),
  });
}

export function useUpdateExpiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
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

export function useDiscardExpiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      discard_reason,
      discarded_quantity,
      notes,
    }: {
      id: string;
      discard_reason: string;
      discarded_quantity?: number;
      notes?: string;
    }) => {
      const update: any = {
        status: "descartado",
        discard_reason,
        discarded_at: new Date().toISOString(),
      };
      if (discarded_quantity !== undefined) update.discarded_quantity = discarded_quantity;
      if (notes !== undefined) update.notes = notes;
      const { error } = await supabase.from("product_expiry_tracking").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-expiry"] });
      qc.invalidateQueries({ queryKey: ["product-expiry-history"] });
      qc.invalidateQueries({ queryKey: ["expiry-loss-summary"] });
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

export function useExpiryLossSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["expiry-loss-summary", user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, totalValue: 0 };
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("product_expiry_tracking")
        .select("unit_cost, discarded_quantity, quantity")
        .eq("user_id", user.id)
        .eq("status", "descartado")
        .gte("discarded_at", startOfMonth.toISOString());
      const items = data || [];
      const count = items.length;
      const totalValue = items.reduce((sum, i: any) => {
        const qty = i.discarded_quantity || i.quantity || 1;
        const cost = i.unit_cost || 0;
        return sum + qty * cost;
      }, 0);
      return { count, totalValue };
    },
    enabled: !!user?.id,
  });
}

export function useFrequentProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["frequent-products", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("product_expiry_tracking")
        .select("product_name, category")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!data) return [];
      const map = new Map<string, { name: string; category: string; count: number }>();
      data.forEach((d: any) => {
        const key = d.product_name;
        if (map.has(key)) {
          map.get(key)!.count++;
        } else {
          map.set(key, { name: d.product_name, category: d.category || "outros", count: 1 });
        }
      });
      return Array.from(map.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    enabled: !!user?.id,
  });
}

export const CATEGORIES = [
  { value: "carnes", label: "Carnes", color: "bg-red-100 text-red-700" },
  { value: "laticinios", label: "Laticínios", color: "bg-blue-100 text-blue-700" },
  { value: "hortifruti", label: "Hortifruti", color: "bg-green-100 text-green-700" },
  { value: "bebidas", label: "Bebidas", color: "bg-purple-100 text-purple-700" },
  { value: "secos", label: "Secos", color: "bg-amber-100 text-amber-700" },
  { value: "congelados", label: "Congelados", color: "bg-cyan-100 text-cyan-700" },
  { value: "outros", label: "Outros", color: "bg-gray-100 text-gray-700" },
];

export const STORAGE_LOCATIONS = [
  { value: "camara_fria", label: "Câmara fria" },
  { value: "freezer", label: "Freezer" },
  { value: "prateleira", label: "Prateleira" },
  { value: "geladeira", label: "Geladeira" },
];

export const UNITS = ["unidades", "kg", "g", "litros", "ml", "caixas"];
