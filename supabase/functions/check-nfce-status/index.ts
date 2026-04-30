import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch("https://auth.nuvemfiscal.com.br/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "empresa nfce",
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`OAuth Nuvem Fiscal falhou (${response.status}): ${t}`);
  }
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const NUVEM_FISCAL_CLIENT_ID = Deno.env.get("NUVEM_FISCAL_CLIENT_ID");
  const NUVEM_FISCAL_CLIENT_SECRET = Deno.env.get("NUVEM_FISCAL_CLIENT_SECRET");

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ success: false, error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!NUVEM_FISCAL_CLIENT_ID || !NUVEM_FISCAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais Nuvem Fiscal ausentes" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const emissionId: string | undefined = body?.emission_id;
    if (!emissionId) {
      return new Response(JSON.stringify({ success: false, error: "emission_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: emission, error: fetchErr } = await admin
      .from("pdv_nfce_emissions").select("*").eq("id", emissionId).maybeSingle();
    if (fetchErr || !emission) {
      return new Response(JSON.stringify({ success: false, error: "Cupom não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!emission.nuvem_fiscal_id) {
      return new Response(JSON.stringify({ success: false, error: "Cupom sem ID Nuvem Fiscal" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken(NUVEM_FISCAL_CLIENT_ID, NUVEM_FISCAL_CLIENT_SECRET);
    const resp = await fetch(`https://api.nuvemfiscal.com.br/nfce/${emission.nuvem_fiscal_id}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await admin.from("pdv_nfce_emissions").update({
        last_status_check_at: new Date().toISOString(),
      }).eq("id", emissionId);
      return new Response(JSON.stringify({
        success: false, error: json?.message || `HTTP ${resp.status}`, details: json,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const status = json?.status || "pendente";
    const isAuthorized = status === "autorizado" || status === "autorizada";
    const isCancelled = status === "cancelado" || status === "cancelada";
    const newStatus = isAuthorized ? "autorizada" : isCancelled ? "cancelada" : (status === "rejeitado" ? "rejeitada" : "pendente");

    await admin.from("pdv_nfce_emissions").update({
      status: newStatus,
      chave_acesso: json?.chave || json?.chave_acesso || emission.chave_acesso,
      protocolo_autorizacao: json?.numero_protocolo || json?.protocolo || emission.protocolo_autorizacao,
      numero: json?.numero || emission.numero,
      data_autorizacao: isAuthorized && !emission.data_autorizacao ? new Date().toISOString() : emission.data_autorizacao,
      rejection_reason: !isAuthorized && !isCancelled ? (json?.mensagem || emission.rejection_reason) : null,
      last_status_check_at: new Date().toISOString(),
    }).eq("id", emissionId);

    return new Response(JSON.stringify({
      success: true, status: newStatus, details: json,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("check-nfce-status error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
