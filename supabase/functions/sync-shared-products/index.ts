import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Não autorizado");

    const { data: isSA } = await supabase.rpc("is_super_admin");
    if (!isSA) throw new Error("Acesso restrito a super admins");

    const body = await req.json();
    const { action, source_tenant_id, target_tenant_ids, product_ids, table_ids } = body;

    if (action === "share_products") {
      // Get source tenant owner
      const { data: sourceTenant } = await supabase
        .from("tenants")
        .select("owner_user_id")
        .eq("id", source_tenant_id)
        .single();

      if (!sourceTenant?.owner_user_id) throw new Error("Tenant matriz sem owner");

      // Get source products
      const { data: products, error: pErr } = await supabase
        .from("pdv_products")
        .select("*")
        .eq("user_id", sourceTenant.owner_user_id)
        .in("id", product_ids);

      if (pErr) throw pErr;
      if (!products?.length) throw new Error("Nenhum produto encontrado");

      let clonedCount = 0;

      for (const targetId of target_tenant_ids) {
        const { data: targetTenant } = await supabase
          .from("tenants")
          .select("owner_user_id")
          .eq("id", targetId)
          .single();

        if (!targetTenant?.owner_user_id) continue;

        for (const product of products) {
          // Check if already shared
          const { data: existing } = await supabase
            .from("shared_products")
            .select("id, cloned_product_id")
            .eq("source_product_id", product.id)
            .eq("target_tenant_id", targetId)
            .maybeSingle();

          if (existing) continue; // already shared

          // Clone product
          const { data: cloned, error: cloneErr } = await supabase
            .from("pdv_products")
            .insert({
              name: product.name,
              category: product.category,
              price_salon: product.price_salon,
              price_balcao: product.price_balcao,
              price_delivery: product.price_delivery,
              description: product.description,
              image_url: product.image_url,
              is_available: product.is_available,
              is_sold_by_weight: product.is_sold_by_weight,
              preparation_time: product.preparation_time,
              serves: product.serves,
              available_times: product.available_times,
              user_id: targetTenant.owner_user_id,
            })
            .select("id")
            .single();

          if (cloneErr) {
            console.error("Erro ao clonar produto:", cloneErr);
            continue;
          }

          // Register shared relationship
          await supabase.from("shared_products").insert({
            source_tenant_id,
            target_tenant_id: targetId,
            source_product_id: product.id,
            cloned_product_id: cloned.id,
            sync_enabled: true,
            last_synced_at: new Date().toISOString(),
          });

          clonedCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, cloned: clonedCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "sync_products") {
      // Sync existing shared products from source
      const { data: shared, error: shErr } = await supabase
        .from("shared_products")
        .select("*, source_product:pdv_products!shared_products_source_product_id_fkey(*)")
        .eq("source_tenant_id", source_tenant_id)
        .eq("sync_enabled", true);

      if (shErr) throw shErr;

      let syncedCount = 0;

      for (const item of shared || []) {
        if (!item.cloned_product_id || !item.source_product) continue;

        const src = item.source_product as any;
        const { error: upErr } = await supabase
          .from("pdv_products")
          .update({
            name: src.name,
            category: src.category,
            price_salon: src.price_salon,
            price_balcao: src.price_balcao,
            price_delivery: src.price_delivery,
            description: src.description,
            image_url: src.image_url,
            is_available: src.is_available,
            preparation_time: src.preparation_time,
          })
          .eq("id", item.cloned_product_id);

        if (!upErr) {
          await supabase
            .from("shared_products")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", item.id);
          syncedCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, synced: syncedCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "share_tables") {
      const { data: sourceTenant } = await supabase
        .from("tenants")
        .select("owner_user_id")
        .eq("id", source_tenant_id)
        .single();

      if (!sourceTenant?.owner_user_id) throw new Error("Tenant matriz sem owner");

      const { data: tables, error: tErr } = await supabase
        .from("pdv_tables")
        .select("*")
        .eq("user_id", sourceTenant.owner_user_id)
        .in("id", table_ids);

      if (tErr) throw tErr;

      let clonedCount = 0;

      for (const targetId of target_tenant_ids) {
        const { data: targetTenant } = await supabase
          .from("tenants")
          .select("owner_user_id")
          .eq("id", targetId)
          .single();

        if (!targetTenant?.owner_user_id) continue;

        for (const table of tables || []) {
          const { data: existing } = await supabase
            .from("shared_table_layouts")
            .select("id")
            .eq("source_table_id", table.id)
            .eq("target_tenant_id", targetId)
            .maybeSingle();

          if (existing) continue;

          const { data: cloned, error: cloneErr } = await supabase
            .from("pdv_tables")
            .insert({
              table_number: table.table_number,
              capacity: table.capacity,
              position_x: table.position_x,
              position_y: table.position_y,
              shape: table.shape,
              is_active: true,
              user_id: targetTenant.owner_user_id,
            })
            .select("id")
            .single();

          if (cloneErr) continue;

          await supabase.from("shared_table_layouts").insert({
            source_tenant_id,
            target_tenant_id: targetId,
            source_table_id: table.id,
            cloned_table_id: cloned.id,
          });

          clonedCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, cloned: clonedCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Ação inválida");
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
