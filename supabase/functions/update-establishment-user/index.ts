import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const anonClient = createClient(supabaseUrl, anonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      establishment_user_id,
      display_name,
      phone,
      role,
      discount_password,
      max_discount_percent,
      password,
    } = body;

    if (!establishment_user_id) {
      return new Response(JSON.stringify({ error: "Missing establishment_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password && String(password).length < 6) {
      return new Response(JSON.stringify({ error: "Senha deve ter no mínimo 6 caracteres" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify the target row belongs to caller
    const { data: target, error: targetError } = await adminClient
      .from("establishment_users")
      .select("id, user_id, establishment_owner_id")
      .eq("id", establishment_user_id)
      .single();

    if (targetError || !target) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (target.establishment_owner_id !== caller.id) {
      return new Response(JSON.stringify({ error: "Sem permissão" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update establishment_users row
    const updatePayload: Record<string, unknown> = {};
    if (display_name !== undefined) updatePayload.display_name = display_name;
    if (phone !== undefined) updatePayload.phone = phone || null;
    if (role !== undefined) updatePayload.role = role;
    if (discount_password !== undefined) updatePayload.discount_password = discount_password || null;
    if (max_discount_percent !== undefined) updatePayload.max_discount_percent = max_discount_percent ?? 100;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await adminClient
        .from("establishment_users")
        .update(updatePayload)
        .eq("id", establishment_user_id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update password if provided
    if (password) {
      if (target.user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Não é possível alterar a própria senha por aqui" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: pwError } = await adminClient.auth.admin.updateUserById(target.user_id, {
        password: String(password),
      });
      if (pwError) {
        return new Response(JSON.stringify({ error: pwError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
