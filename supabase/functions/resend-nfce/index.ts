import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Reenvia (re-emite) um cupom NFC-e que foi rejeitado.
 * Reutiliza items_snapshot e demais dados, chamando a função emit-nfce existente.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    if (emission.status === "autorizada" || emission.status === "cancelada") {
      return new Response(JSON.stringify({ success: false, error: "Não é possível reenviar cupom já " + emission.status }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(emission.items_snapshot) || emission.items_snapshot.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Cupom sem snapshot de itens para reenvio" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emitPayload = {
      user_id: emission.user_id,
      comanda_id: emission.comanda_id,
      table_id: emission.table_id,
      order_id: emission.order_id,
      cashier_session_id: emission.cashier_session_id,
      items: emission.items_snapshot,
      valor_desconto: Number(emission.valor_desconto || 0),
      valor_servico: Number(emission.valor_servico || 0),
      forma_pagamento: emission.forma_pagamento || "outros",
      parcelas: emission.parcelas || 1,
      customer: {
        cpf: emission.customer_cpf,
        email: emission.customer_email,
        name: emission.customer_name,
      },
    };

    // Chama emit-nfce reaproveitando token do usuário (RLS-friendly)
    const emitResp = await fetch(`${SUPABASE_URL}/functions/v1/emit-nfce`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(emitPayload),
    });
    const emitJson = await emitResp.json().catch(() => ({}));

    // Vincula nova emissão ao cupom original
    if (emitJson?.emission_id) {
      await admin.from("pdv_nfce_emissions")
        .update({ parent_emission_id: emissionId })
        .eq("id", emitJson.emission_id);
    }

    return new Response(JSON.stringify(emitJson), {
      status: emitResp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("resend-nfce error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
