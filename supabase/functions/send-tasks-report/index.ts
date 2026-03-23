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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const evoUrl = Deno.env.get("EVOLUTION_API_URL")!;
    const evoKey = Deno.env.get("EVOLUTION_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { user_id, date } = await req.json();

    // If called via cron (no user_id), process all enabled tenants
    if (!user_id) {
      return await handleCron(supabase, evoUrl, evoKey);
    }

    const today = date || new Date().toISOString().split("T")[0];
    const result = await sendReportForUser(supabase, evoUrl, evoKey, user_id, today);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-tasks-report error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCron(supabase: any, evoUrl: string, evoKey: string) {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, "0");
  const currentMinute = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHour}:${currentMinute}`;
  const today = now.toISOString().split("T")[0];

  // Find all users with auto report enabled and matching time (within 30min window)
  const { data: settings, error } = await supabase
    .from("operational_task_settings")
    .select("user_id, whatsapp_report_time")
    .eq("whatsapp_report_enabled", true)
    .not("whatsapp_report_phone", "is", null);

  if (error) throw error;
  if (!settings || settings.length === 0) {
    return new Response(JSON.stringify({ message: "No users with auto report enabled" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = [];
  for (const s of settings) {
    const reportTime = s.whatsapp_report_time || "23:00";
    // Check if current time matches (exact hour match)
    if (reportTime.substring(0, 2) === currentHour) {
      try {
        const r = await sendReportForUser(supabase, evoUrl, evoKey, s.user_id, today);
        results.push({ user_id: s.user_id, ...r });
      } catch (e: any) {
        results.push({ user_id: s.user_id, error: e.message });
      }
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendReportForUser(
  supabase: any,
  evoUrl: string,
  evoKey: string,
  userId: string,
  date: string
) {
  // 1. Get task settings
  const { data: settings, error: settingsErr } = await supabase
    .from("operational_task_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (settingsErr) throw settingsErr;
  if (!settings?.whatsapp_report_phone) {
    throw new Error("Número de telefone para relatório não configurado");
  }

  // 2. Get WhatsApp connection
  const { data: conn, error: connErr } = await supabase
    .from("whatsapp_connections")
    .select("instance_name")
    .eq("user_id", userId)
    .eq("connection_status", "open")
    .maybeSingle();

  if (connErr) throw connErr;
  if (!conn) {
    throw new Error("WhatsApp não está conectado. Conecte primeiro nas configurações.");
  }

  // 3. Get task instances for the date
  const { data: tasks, error: tasksErr } = await supabase
    .from("operational_task_instances")
    .select("*")
    .eq("user_id", userId)
    .eq("task_date", date)
    .order("shift")
    .order("title");

  if (tasksErr) throw tasksErr;
  if (!tasks || tasks.length === 0) {
    throw new Error("Nenhuma tarefa encontrada para esta data");
  }

  // 4. Get shifts config
  const shifts = (settings.shifts as any[]) || [
    { name: "Abertura", start: "06:00", end: "11:00" },
    { name: "Tarde", start: "11:00", end: "17:00" },
    { name: "Fechamento", start: "17:00", end: "23:00" },
  ];

  // 5. Build message
  const message = buildReportMessage(tasks, shifts, date);

  // 6. Send via Evolution API
  const phone = settings.whatsapp_report_phone.replace(/\D/g, "");
  const instanceName = encodeURIComponent(conn.instance_name);

  const evoResponse = await fetch(`${evoUrl}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: evoKey,
    },
    body: JSON.stringify({
      number: phone,
      text: message,
    }),
  });

  if (!evoResponse.ok) {
    const errBody = await evoResponse.text();
    console.error("Evolution API error:", errBody);
    throw new Error("Falha ao enviar mensagem via WhatsApp");
  }

  await evoResponse.text();

  return { success: true, message: "Relatório enviado com sucesso!" };
}

function buildReportMessage(tasks: any[], shifts: any[], date: string) {
  const shiftEmojis: Record<string, string> = {
    "Abertura": "🌅",
    "Tarde": "☀️",
    "Fechamento": "🌙",
  };

  // Format date
  const [y, m, d] = date.split("-");
  const formattedDate = `${d}/${m}/${y}`;

  const total = tasks.length;
  const done = tasks.filter((t: any) => t.status === "done").length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Group by shift
  const grouped: Record<string, any[]> = {};
  for (const t of tasks) {
    if (!grouped[t.shift]) grouped[t.shift] = [];
    grouped[t.shift].push(t);
  }

  let msg = `📋 *Relatório de Tarefas — ${formattedDate}*\n\n`;
  msg += `✅ Concluídas: ${done}/${total} (${pct}%)\n`;

  for (const shift of shifts) {
    const shiftTasks = grouped[shift.name] || [];
    if (shiftTasks.length === 0) continue;

    const emoji = shiftEmojis[shift.name] || "📌";
    msg += `\n*${emoji} ${shift.name} (${shift.start}-${shift.end})*\n`;

    for (const t of shiftTasks) {
      if (t.status === "done") {
        const completedTime = t.completed_at
          ? new Date(t.completed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          : "";
        const by = t.completed_by ? ` — ${t.completed_by}` : "";
        msg += `✅ ${t.title}${by} ${completedTime}\n`;
      } else if (t.status === "skipped") {
        msg += `⏭️ ${t.title} (pulada)\n`;
      } else {
        msg += `❌ ${t.title}\n`;
      }
    }
  }

  if (pending > 0) {
    msg += `\n📊 *Pendentes: ${pending} tarefa${pending > 1 ? "s" : ""} não concluída${pending > 1 ? "s" : ""}*`;
  } else {
    msg += `\n🎉 *Todas as tarefas foram concluídas!*`;
  }

  return msg;
}
