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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ success: false, error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!NUVEM_FISCAL_CLIENT_ID || !NUVEM_FISCAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais Nuvem Fiscal ausentes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const emissionId: string | undefined = body?.emission_id;
    const justificativa: string | undefined = body?.justificativa;

    if (!emissionId || !justificativa || justificativa.length < 15) {
      return new Response(JSON.stringify({
        success: false,
        error: "emission_id e justificativa (mín. 15 caracteres) são obrigatórios",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: emission, error: fetchErr } = await admin
      .from("pdv_nfce_emissions")
      .select("*")
      .eq("id", emissionId)
      .maybeSingle();

    if (fetchErr || !emission) {
      return new Response(JSON.stringify({ success: false, error: "Cupom não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (emission.status !== "autorizada") {
      return new Response(JSON.stringify({ success: false, error: "Apenas cupons autorizados podem ser cancelados" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!emission.nuvem_fiscal_id) {
      return new Response(JSON.stringify({ success: false, error: "Cupom sem ID Nuvem Fiscal" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken(NUVEM_FISCAL_CLIENT_ID, NUVEM_FISCAL_CLIENT_SECRET);

    const cancelResp = await fetch(`https://api.nuvemfiscal.com.br/nfce/${emission.nuvem_fiscal_id}/cancelamento`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ justificativa }),
    });

    const cancelJson = await cancelResp.json().catch(() => ({}));

    if (!cancelResp.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: cancelJson?.message || cancelJson?.mensagem || `HTTP ${cancelResp.status}`,
        details: cancelJson,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const protocolo = cancelJson?.numero_protocolo || cancelJson?.protocolo || null;

    await admin.from("pdv_nfce_emissions").update({
      status: "cancelada",
      cancellation_reason: justificativa,
      cancellation_protocol: protocolo,
      cancelled_at: new Date().toISOString(),
    }).eq("id", emissionId);

    return new Response(JSON.stringify({
      success: true,
      protocolo,
      status: "cancelada",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("cancel-nfce error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
