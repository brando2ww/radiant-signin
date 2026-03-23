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
    const NFE_API_KEY = Deno.env.get("NFE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!NFE_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "NFE_API_KEY não configurada. Configure o secret no Supabase para ativar a importação automática.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse optional user_id from body
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.user_id || null;
    } catch {
      // No body — run for all enabled tenants
    }

    // Fetch tenants with auto-import enabled
    let query = supabase
      .from("pdv_settings")
      .select("user_id, nfe_auto_import_cnpj, business_cnpj")
      .eq("nfe_auto_import_enabled", true);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: tenants, error: tenantsError } = await query;
    if (tenantsError) throw tenantsError;

    if (!tenants || tenants.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Nenhum tenant com importação ativa.", imported: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalImported = 0;

    for (const tenant of tenants) {
      const cnpj = (tenant.nfe_auto_import_cnpj || tenant.business_cnpj || "").replace(/\D/g, "");
      if (!cnpj || cnpj.length !== 14) continue;

      // Call DistDFe API (Nuvem Fiscal or similar)
      // Placeholder: replace with real API endpoint
      const apiUrl = `https://api.nuvemfiscal.com.br/nfe/distribuicao/documentos?cpf_cnpj=${cnpj}&ambiente=producao`;

      const apiResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${NFE_API_KEY}`,
          Accept: "application/json",
        },
      });

      if (!apiResponse.ok) {
        console.error(`Erro API DistDFe para CNPJ ${cnpj}: ${apiResponse.status}`);
        continue;
      }

      const apiData = await apiResponse.json();
      const documents = apiData?.documentos || apiData?.data || [];

      for (const doc of documents) {
        const accessKey = doc.chave || doc.chave_acesso || doc.key;
        if (!accessKey) continue;

        // Check if already imported
        const { data: existing } = await supabase
          .from("pdv_invoices")
          .select("id")
          .eq("user_id", tenant.user_id)
          .eq("access_key", accessKey)
          .maybeSingle();

        if (existing) continue;

        // Insert new invoice
        const { error: insertError } = await supabase.from("pdv_invoices").insert({
          user_id: tenant.user_id,
          access_key: accessKey,
          supplier_name: doc.emit_nome || doc.supplier_name || "Fornecedor",
          supplier_cnpj: doc.emit_cnpj || doc.supplier_cnpj || "",
          invoice_number: doc.numero || doc.invoice_number || "",
          invoice_series: doc.serie || "",
          issue_date: doc.data_emissao || doc.issue_date || new Date().toISOString(),
          total_value: doc.valor_total || doc.total || 0,
          status: "pending",
          xml_content: doc.xml || null,
          source: "sefaz_auto",
        });

        if (insertError) {
          console.error(`Erro ao inserir NF-e ${accessKey}:`, insertError.message);
        } else {
          totalImported++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, imported: totalImported }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro fetch-nfe-automatica:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
