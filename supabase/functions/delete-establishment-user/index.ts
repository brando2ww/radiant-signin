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

    const { establishment_user_id } = await req.json();
    if (!establishment_user_id) {
      return new Response(JSON.stringify({ error: "Missing establishment_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

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

    if (target.user_id === caller.id) {
      return new Response(JSON.stringify({ error: "Não é possível excluir a si mesmo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the establishment_users row first (vínculo)
    const { error: deleteRowError } = await adminClient
      .from("establishment_users")
      .delete()
      .eq("id", establishment_user_id);

    if (deleteRowError) {
      return new Response(JSON.stringify({ error: deleteRowError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the auth user (cascades to profiles via FK)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(target.user_id);
    if (authDeleteError) {
      // Vínculo já foi removido — reportamos o erro mas não restauramos
      return new Response(
        JSON.stringify({
          success: true,
          warning: `Vínculo removido, mas a conta de auth não pôde ser excluída: ${authDeleteError.message}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
