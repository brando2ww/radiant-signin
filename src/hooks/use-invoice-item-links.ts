import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";

export interface InvoiceItemLink {
  id: string;
  user_id: string;
  supplier_id: string | null;
  supplier_cnpj: string | null;
  product_code: string | null;
  product_ean: string | null;
  ingredient_id: string;
  times_used: number;
  last_used_at: string;
}

export function useInvoiceItemLinks(supplierId?: string | null, supplierCnpj?: string | null) {
  const { visibleUserId } = useEstablishmentId();

  const { data, isLoading } = useQuery({
    queryKey: ["pdv-invoice-item-links", visibleUserId, supplierId || supplierCnpj],
    queryFn: async () => {
      if (!visibleUserId) return [] as InvoiceItemLink[];
      let query = supabase
        .from("pdv_invoice_item_links")
        .select("*")
        .eq("user_id", visibleUserId);

      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      } else if (supplierCnpj) {
        const cnpjDigits = supplierCnpj.replace(/\D/g, "");
        query = query.eq("supplier_cnpj", cnpjDigits);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as InvoiceItemLink[];
    },
    enabled: !!visibleUserId,
  });

  return { links: data || [], isLoading };
}

export async function upsertInvoiceItemLinks(
  userId: string,
  rows: Array<{
    supplier_id: string | null;
    supplier_cnpj: string | null;
    product_code: string | null;
    product_ean: string | null;
    ingredient_id: string;
  }>
) {
  if (!rows.length) return;
  const cleaned = rows
    .filter((r) => r.ingredient_id && (r.product_code || r.product_ean))
    .map((r) => ({
      user_id: userId,
      supplier_id: r.supplier_id,
      supplier_cnpj: r.supplier_cnpj ? r.supplier_cnpj.replace(/\D/g, "") : null,
      product_code: r.product_code || null,
      product_ean: r.product_ean ? r.product_ean.replace(/\D/g, "") : null,
      ingredient_id: r.ingredient_id,
      times_used: 1,
      last_used_at: new Date().toISOString(),
    }));
  if (!cleaned.length) return;

  // upsert via onConflict on the unique index
  const { error } = await supabase
    .from("pdv_invoice_item_links")
    .upsert(cleaned, {
      onConflict: "user_id,supplier_id,product_code,product_ean",
      ignoreDuplicates: false,
    });
  if (error) {
    // Fallback: best-effort insert ignoring conflicts
    console.warn("[invoice-item-links] upsert error, fallback insert:", error.message);
    await supabase.from("pdv_invoice_item_links").insert(cleaned);
  }
}
