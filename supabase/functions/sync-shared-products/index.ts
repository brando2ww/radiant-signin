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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Não autorizado");

    const body = await req.json();
    const { action, source_tenant_id, target_tenant_ids, product_ids, table_ids, target_tenant_id } = body;

    // Helper: get tenant owner
    async function getTenantOwner(tenantId: string) {
      const { data } = await supabase
        .from("tenants")
        .select("owner_user_id, parent_tenant_id")
        .eq("id", tenantId)
        .single();
      return data;
    }

    // Helper: clone products from source owner to target owner
    async function cloneProducts(sourceOwnerId: string, targetOwnerId: string, sourceTenantId: string, targetTenantId: string, productIds: string[]) {
      const { data: products, error: pErr } = await supabase
        .from("pdv_products")
        .select("*")
        .eq("user_id", sourceOwnerId)
        .in("id", productIds);

      if (pErr) throw pErr;
      if (!products?.length) throw new Error("Nenhum produto encontrado");

      let clonedCount = 0;
      for (const product of products) {
        const { data: existing } = await supabase
          .from("shared_products")
          .select("id")
          .eq("source_product_id", product.id)
          .eq("target_tenant_id", targetTenantId)
          .maybeSingle();

        if (existing) continue;

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
            user_id: targetOwnerId,
          })
          .select("id")
          .single();

        if (cloneErr) { console.error("Erro ao clonar produto:", cloneErr); continue; }

        await supabase.from("shared_products").insert({
          source_tenant_id: sourceTenantId,
          target_tenant_id: targetTenantId,
          source_product_id: product.id,
          cloned_product_id: cloned.id,
          sync_enabled: true,
          last_synced_at: new Date().toISOString(),
        });
        clonedCount++;
      }
      return clonedCount;
    }

    // Helper: clone tables
    async function cloneTables(sourceOwnerId: string, targetOwnerId: string, sourceTenantId: string, targetTenantId: string, tableIds: string[]) {
      const { data: tables, error: tErr } = await supabase
        .from("pdv_tables")
        .select("*")
        .eq("user_id", sourceOwnerId)
        .in("id", tableIds);

      if (tErr) throw tErr;
      let clonedCount = 0;

      for (const table of tables || []) {
        const { data: existing } = await supabase
          .from("shared_table_layouts")
          .select("id")
          .eq("source_table_id", table.id)
          .eq("target_tenant_id", targetTenantId)
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
            user_id: targetOwnerId,
          })
          .select("id")
          .single();

        if (cloneErr) continue;

        await supabase.from("shared_table_layouts").insert({
          source_tenant_id: sourceTenantId,
          target_tenant_id: targetTenantId,
          source_table_id: table.id,
          cloned_table_id: cloned.id,
        });
        clonedCount++;
      }
      return clonedCount;
    }

    // === SUPER ADMIN ACTIONS ===

    if (action === "share_products") {
      const { data: isSA } = await supabase.rpc("is_super_admin");
      if (!isSA) throw new Error("Acesso restrito a super admins");

      const sourceTenant = await getTenantOwner(source_tenant_id);
      if (!sourceTenant?.owner_user_id) throw new Error("Tenant matriz sem owner");

      let totalCloned = 0;
      for (const tid of target_tenant_ids) {
        const targetTenant = await getTenantOwner(tid);
        if (!targetTenant?.owner_user_id) continue;
        totalCloned += await cloneProducts(sourceTenant.owner_user_id, targetTenant.owner_user_id, source_tenant_id, tid, product_ids);
      }

      return new Response(
        JSON.stringify({ success: true, cloned: totalCloned }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "sync_products") {
      const { data: isSA } = await supabase.rpc("is_super_admin");
      if (!isSA) throw new Error("Acesso restrito a super admins");

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
            name: src.name, category: src.category,
            price_salon: src.price_salon, price_balcao: src.price_balcao,
            price_delivery: src.price_delivery, description: src.description,
            image_url: src.image_url, is_available: src.is_available,
            preparation_time: src.preparation_time,
          })
          .eq("id", item.cloned_product_id);

        if (!upErr) {
          await supabase.from("shared_products").update({ last_synced_at: new Date().toISOString() }).eq("id", item.id);
          syncedCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, synced: syncedCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "share_tables") {
      const { data: isSA } = await supabase.rpc("is_super_admin");
      if (!isSA) throw new Error("Acesso restrito a super admins");

      const sourceTenant = await getTenantOwner(source_tenant_id);
      if (!sourceTenant?.owner_user_id) throw new Error("Tenant matriz sem owner");

      let totalCloned = 0;
      for (const tid of target_tenant_ids) {
        const targetTenant = await getTenantOwner(tid);
        if (!targetTenant?.owner_user_id) continue;
        totalCloned += await cloneTables(sourceTenant.owner_user_id, targetTenant.owner_user_id, source_tenant_id, tid, table_ids);
      }

      return new Response(
        JSON.stringify({ success: true, cloned: totalCloned }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === FRANCHISE (CHILD TENANT) ACTIONS ===

    if (action === "import_products") {
      // Franchise pulling products from parent
      const targetTenant = await getTenantOwner(target_tenant_id);
      if (!targetTenant?.owner_user_id || !targetTenant?.parent_tenant_id)
        throw new Error("Tenant não é franquia ou sem owner");

      // Verify caller belongs to target tenant
      const isOwner = targetTenant.owner_user_id === user.id;
      const { data: isMember } = await supabase
        .from("establishment_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", target_tenant_id)
        .eq("is_active", true)
        .maybeSingle();
      if (!isOwner && !isMember) throw new Error("Sem permissão para este tenant");

      const parentTenant = await getTenantOwner(targetTenant.parent_tenant_id);
      if (!parentTenant?.owner_user_id) throw new Error("Matriz sem owner");

      const cloned = await cloneProducts(
        parentTenant.owner_user_id,
        targetTenant.owner_user_id,
        targetTenant.parent_tenant_id,
        target_tenant_id,
        product_ids
      );

      return new Response(
        JSON.stringify({ success: true, cloned }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "import_tables") {
      const targetTenant = await getTenantOwner(target_tenant_id);
      if (!targetTenant?.owner_user_id || !targetTenant?.parent_tenant_id)
        throw new Error("Tenant não é franquia ou sem owner");

      const isOwner = targetTenant.owner_user_id === user.id;
      const { data: isMember } = await supabase
        .from("establishment_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", target_tenant_id)
        .eq("is_active", true)
        .maybeSingle();
      if (!isOwner && !isMember) throw new Error("Sem permissão para este tenant");

      const parentTenant = await getTenantOwner(targetTenant.parent_tenant_id);
      if (!parentTenant?.owner_user_id) throw new Error("Matriz sem owner");

      const cloned = await cloneTables(
        parentTenant.owner_user_id,
        targetTenant.owner_user_id,
        targetTenant.parent_tenant_id,
        target_tenant_id,
        table_ids
      );

      return new Response(
        JSON.stringify({ success: true, cloned }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "import_delivery_settings") {
      const targetTenant = await getTenantOwner(target_tenant_id);
      if (!targetTenant?.owner_user_id || !targetTenant?.parent_tenant_id)
        throw new Error("Tenant não é franquia ou sem owner");

      const isOwner = targetTenant.owner_user_id === user.id;
      const { data: isMember } = await supabase
        .from("establishment_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", target_tenant_id)
        .eq("is_active", true)
        .maybeSingle();
      if (!isOwner && !isMember) throw new Error("Sem permissão para este tenant");

      const parentTenant = await getTenantOwner(targetTenant.parent_tenant_id);
      if (!parentTenant?.owner_user_id) throw new Error("Matriz sem owner");

      // Get parent delivery settings
      const { data: parentSettings } = await supabase
        .from("delivery_settings")
        .select("*")
        .eq("user_id", parentTenant.owner_user_id)
        .maybeSingle();

      if (!parentSettings) throw new Error("Matriz não tem configurações de delivery");

      // Upsert target delivery settings
      const { data: existing } = await supabase
        .from("delivery_settings")
        .select("id")
        .eq("user_id", targetTenant.owner_user_id)
        .maybeSingle();

      const settingsPayload = {
        business_hours: parentSettings.business_hours,
        delivery_zones: parentSettings.delivery_zones,
        default_delivery_fee: parentSettings.default_delivery_fee,
        min_order_value: parentSettings.min_order_value,
        max_delivery_distance: parentSettings.max_delivery_distance,
        estimated_preparation_time: parentSettings.estimated_preparation_time,
        accepts_cash: parentSettings.accepts_cash,
        accepts_credit: parentSettings.accepts_credit,
        accepts_debit: parentSettings.accepts_debit,
        accepts_pix: parentSettings.accepts_pix,
        auto_accept_orders: parentSettings.auto_accept_orders,
      };

      if (existing) {
        await supabase
          .from("delivery_settings")
          .update(settingsPayload)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("delivery_settings")
          .insert({ ...settingsPayload, user_id: targetTenant.owner_user_id });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "sync_imported") {
      // Franchise syncing already-imported products from parent
      const targetTenant = await getTenantOwner(target_tenant_id);
      if (!targetTenant?.owner_user_id || !targetTenant?.parent_tenant_id)
        throw new Error("Tenant não é franquia");

      const isOwner = targetTenant.owner_user_id === user.id;
      const { data: isMember } = await supabase
        .from("establishment_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", target_tenant_id)
        .eq("is_active", true)
        .maybeSingle();
      if (!isOwner && !isMember) throw new Error("Sem permissão");

      const { data: shared } = await supabase
        .from("shared_products")
        .select("*, source_product:pdv_products!shared_products_source_product_id_fkey(*)")
        .eq("target_tenant_id", target_tenant_id)
        .eq("sync_enabled", true);

      let syncedCount = 0;
      for (const item of shared || []) {
        if (!item.cloned_product_id || !item.source_product) continue;
        const src = item.source_product as any;
        const { error: upErr } = await supabase
          .from("pdv_products")
          .update({
            name: src.name, category: src.category,
            price_salon: src.price_salon, price_balcao: src.price_balcao,
            price_delivery: src.price_delivery, description: src.description,
            image_url: src.image_url, is_available: src.is_available,
            preparation_time: src.preparation_time,
          })
          .eq("id", item.cloned_product_id);

        if (!upErr) {
          await supabase.from("shared_products").update({ last_synced_at: new Date().toISOString() }).eq("id", item.id);
          syncedCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, synced: syncedCount }),
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
