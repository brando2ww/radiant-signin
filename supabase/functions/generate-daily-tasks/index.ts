import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];

    // Get all users with auto_generate enabled
    const { data: settingsList } = await supabase
      .from("operational_task_settings")
      .select("user_id")
      .eq("auto_generate", true);

    // Also get users with templates but no settings (default auto_generate = true)
    const { data: templateUsers } = await supabase
      .from("operational_task_templates")
      .select("user_id")
      .eq("is_active", true);

    const userIds = new Set<string>();
    settingsList?.forEach((s: any) => userIds.add(s.user_id));
    templateUsers?.forEach((t: any) => userIds.add(t.user_id));

    let generated = 0;

    for (const userId of userIds) {
      // Check if already generated
      const { count } = await supabase
        .from("operational_task_instances")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("task_date", today);

      if ((count || 0) > 0) continue;

      // Get active templates
      const { data: templates } = await supabase
        .from("operational_task_templates")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (!templates || templates.length === 0) continue;

      const rows = templates.map((t: any) => ({
        template_id: t.id,
        user_id: userId,
        task_date: today,
        title: t.title,
        description: t.description,
        shift: t.shift,
        assigned_to: t.assigned_to,
        requires_photo: t.requires_photo,
        status: "pending",
      }));

      await supabase.from("operational_task_instances").insert(rows);
      generated += rows.length;
    }

    return new Response(
      JSON.stringify({ success: true, generated, date: today }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
