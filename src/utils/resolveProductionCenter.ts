import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve o production_center_id de um produto a partir do slug
 * armazenado em pdv_products.printer_station.
 *
 * Retorna null se o produto não tem printer_station definido
 * ou se não existe um centro ativo com aquele slug para o tenant.
 */
export async function resolveProductionCenterId(
  productId: string,
  ownerUserId: string,
): Promise<string | null> {
  if (!productId || !ownerUserId) return null;

  const { data: product, error: productError } = await supabase
    .from("pdv_products")
    .select("printer_station")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product?.printer_station) return null;

  const { data: center, error: centerError } = await supabase
    .from("pdv_production_centers")
    .select("id")
    .eq("user_id", ownerUserId)
    .eq("slug", product.printer_station)
    .eq("is_active", true)
    .maybeSingle();

  if (centerError) return null;
  return center?.id ?? null;
}
