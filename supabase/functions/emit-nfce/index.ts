import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type EmitItem = {
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  ncm?: string | null;
  cfop?: string | null;
  cest?: string | null;
  origem?: number | null;
  ean?: string | null;
  unidade?: string | null;
};

type EmitBody = {
  user_id?: string;
  comanda_id?: string | null;
  table_id?: string | null;
  order_id?: string | null;
  cashier_session_id?: string | null;
  items: EmitItem[];
  valor_desconto?: number;
  valor_servico?: number;
  forma_pagamento: string; // 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'outros'
  valor_pago?: number;
  troco?: number;
  parcelas?: number;
  customer?: { cpf?: string; email?: string; name?: string };
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

// Map our payment shorthand to NFC-e payment code (tPag)
function mapTPag(forma: string): string {
  switch (forma) {
    case "dinheiro": return "01";
    case "cartao_credito":
    case "cartao": return "03";
    case "cartao_debito": return "04";
    case "pix": return "17";
    default: return "99";
  }
}

function digits(v: string | null | undefined): string {
  return (v || "").replace(/\D/g, "");
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
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ success: false, error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string;

    if (!NUVEM_FISCAL_CLIENT_ID || !NUVEM_FISCAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({
        success: false,
        error: "Credenciais Nuvem Fiscal não configuradas no servidor.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = (await req.json()) as EmitBody;
    if (!body?.items?.length || !body?.forma_pagamento) {
      return new Response(JSON.stringify({ success: false, error: "Payload inválido (items/forma_pagamento)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Resolve owner: caller is owner OR establishment member of body.user_id
    let ownerId = body.user_id || callerId;
    if (ownerId !== callerId) {
      const { data: isMember } = await admin
        .from("establishment_users")
        .select("id")
        .eq("user_id", callerId)
        .eq("establishment_owner_id", ownerId)
        .eq("is_active", true)
        .maybeSingle();
      if (!isMember) {
        return new Response(JSON.stringify({ success: false, error: "Sem permissão para o estabelecimento informado" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch settings
    const { data: settings, error: setErr } = await admin
      .from("pdv_settings")
      .select("*")
      .eq("user_id", ownerId)
      .maybeSingle();
    if (setErr || !settings) {
      return new Response(JSON.stringify({ success: false, error: "Configurações fiscais não encontradas" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate prerequisites
    const cnpj = digits(settings.business_cnpj);
    const csc_id = (settings as any).nfe_csc_id;
    const csc_token = (settings as any).nfe_csc_token;
    const ambiente = settings.nfe_ambiente || "homologacao";
    const serie = parseInt(settings.nfe_serie_nfce || "1", 10);
    const endereco = (settings.nfe_endereco_fiscal || {}) as Record<string, any>;

    const missing: string[] = [];
    if (!settings.nfe_enable_nfce) missing.push("NFC-e desabilitada nas configurações");
    if (cnpj.length !== 14) missing.push("CNPJ do estabelecimento");
    if (!settings.nfe_certificate_url) missing.push("Certificado A1");
    if (!csc_id || !csc_token) missing.push("CSC (ID e Token) — gere no portal SEFAZ");
    if (!endereco.uf || !endereco.codigo_municipio) missing.push("Endereço fiscal completo (UF e código IBGE)");
    if (missing.length) {
      return new Response(JSON.stringify({
        success: false,
        error: "Pré-requisitos faltando para emitir NFC-e",
        missing,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate items have NCM
    const itemsSemNCM = body.items.filter(i => !i.ncm || digits(i.ncm).length !== 8).map(i => i.product_name);
    if (itemsSemNCM.length) {
      return new Response(JSON.stringify({
        success: false,
        error: "Produtos sem NCM válido (8 dígitos)",
        missing: itemsSemNCM,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const valorProdutos = body.items.reduce((s, i) => s + Number(i.subtotal || 0), 0);
    const valorDesconto = Number(body.valor_desconto || 0);
    const valorServico = Number(body.valor_servico || 0);
    const valorTotal = Math.max(0, valorProdutos - valorDesconto + valorServico);

    // Create pending row first
    const { data: pendingRow, error: insErr } = await admin
      .from("pdv_nfce_emissions")
      .insert({
        user_id: ownerId,
        comanda_id: body.comanda_id,
        table_id: body.table_id,
        order_id: body.order_id,
        cashier_session_id: body.cashier_session_id,
        status: "pendente",
        ambiente,
        serie: String(serie),
        valor_total: valorTotal,
        valor_desconto: valorDesconto,
        valor_servico: valorServico,
        forma_pagamento: body.forma_pagamento,
        parcelas: body.parcelas || 1,
        customer_cpf: body.customer?.cpf ? digits(body.customer.cpf) : null,
        customer_email: body.customer?.email || null,
        customer_name: body.customer?.name || null,
        items_snapshot: body.items as any,
      })
      .select()
      .single();
    if (insErr || !pendingRow) {
      throw new Error("Falha ao registrar NFC-e pendente: " + (insErr?.message || "?"));
    }

    // Build NFC-e payload (Nuvem Fiscal schema)
    const cstCsosn = settings.nfe_cst_csosn || "102";
    const isSimples = (settings.tax_regime || "simples") === "simples";
    const aliqIcms = Number(settings.nfe_aliquota_icms || 0);
    const aliqPis = Number(settings.nfe_aliquota_pis || 0);
    const aliqCofins = Number(settings.nfe_aliquota_cofins || 0);
    const cfopPadrao = settings.nfe_cfop_padrao || "5102";

    const nfcePayload = {
      infNFe: {
        versao: "4.00",
        ide: {
          cUF: undefined, // Nuvem Fiscal infere do emitente
          natOp: "VENDA AO CONSUMIDOR",
          mod: 65,
          serie,
          tpNF: 1,
          idDest: 1,
          tpImp: 4,
          tpEmis: 1,
          tpAmb: ambiente === "producao" ? 1 : 2,
          finNFe: 1,
          indFinal: 1,
          indPres: 1,
          procEmi: 0,
        },
        dest: body.customer?.cpf ? {
          CPF: digits(body.customer.cpf),
          xNome: body.customer.name || "CONSUMIDOR",
          indIEDest: 9,
          email: body.customer.email,
        } : undefined,
        det: body.items.map((it, idx) => {
          const valor = Number(it.subtotal || 0);
          const icms = isSimples
            ? { ICMSSN102: { orig: it.origem ?? 0, CSOSN: cstCsosn } }
            : { ICMS00: { orig: it.origem ?? 0, CST: cstCsosn, modBC: 0, vBC: valor, pICMS: aliqIcms, vICMS: +(valor * aliqIcms / 100).toFixed(2) } };
          return {
            nItem: idx + 1,
            prod: {
              cProd: it.product_id || `PRD${idx + 1}`,
              cEAN: it.ean || "SEM GTIN",
              xProd: it.product_name.substring(0, 120),
              NCM: digits(it.ncm!),
              CFOP: it.cfop || cfopPadrao,
              uCom: it.unidade || "UN",
              qCom: Number(it.quantity),
              vUnCom: Number(it.unit_price),
              vProd: valor,
              cEANTrib: it.ean || "SEM GTIN",
              uTrib: it.unidade || "UN",
              qTrib: Number(it.quantity),
              vUnTrib: Number(it.unit_price),
              indTot: 1,
              CEST: it.cest ? digits(it.cest) : undefined,
            },
            imposto: {
              ICMS: icms,
              PIS: { PISAliq: { CST: "01", vBC: valor, pPIS: aliqPis, vPIS: +(valor * aliqPis / 100).toFixed(2) } },
              COFINS: { COFINSAliq: { CST: "01", vBC: valor, pCOFINS: aliqCofins, vCOFINS: +(valor * aliqCofins / 100).toFixed(2) } },
            },
          };
        }),
        total: {
          ICMSTot: {
            vBC: 0, vICMS: 0, vICMSDeson: 0, vFCP: 0, vBCST: 0, vST: 0, vFCPST: 0, vFCPSTRet: 0,
            vProd: +valorProdutos.toFixed(2),
            vFrete: 0, vSeg: 0,
            vDesc: +valorDesconto.toFixed(2),
            vII: 0, vIPI: 0, vIPIDevol: 0, vPIS: 0, vCOFINS: 0,
            vOutro: +valorServico.toFixed(2),
            vNF: +valorTotal.toFixed(2),
          },
        },
        transp: { modFrete: 9 },
        pag: {
          detPag: [{
            indPag: 0,
            tPag: mapTPag(body.forma_pagamento),
            vPag: +valorTotal.toFixed(2),
          }],
          vTroco: body.troco && body.troco > 0 ? +body.troco.toFixed(2) : 0,
        },
      },
    };

    // Get OAuth token + emit
    const accessToken = await getAccessToken(NUVEM_FISCAL_CLIENT_ID, NUVEM_FISCAL_CLIENT_SECRET);

    const emitResp = await fetch("https://api.nuvemfiscal.com.br/nfce", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        infNFe: nfcePayload.infNFe,
        ambiente,
        referencia: pendingRow.id,
      }),
    });

    const emitJson = await emitResp.json().catch(() => ({}));

    if (!emitResp.ok) {
      const motivo = emitJson?.mensagem || emitJson?.error?.message || `HTTP ${emitResp.status}`;
      await admin.from("pdv_nfce_emissions").update({
        status: "rejeitada",
        rejection_reason: motivo,
        error_payload: emitJson as any,
      }).eq("id", pendingRow.id);

      return new Response(JSON.stringify({
        success: false,
        status: "rejeitada",
        motivo,
        details: emitJson,
        emission_id: pendingRow.id,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const status = emitJson?.status || "pendente";
    const isAuthorized = status === "autorizado" || status === "autorizada";
    const chave = emitJson?.chave || emitJson?.chave_acesso;
    const protocolo = emitJson?.numero_protocolo || emitJson?.protocolo;
    const numero = emitJson?.numero;

    await admin.from("pdv_nfce_emissions").update({
      status: isAuthorized ? "autorizada" : (status === "rejeitado" ? "rejeitada" : "pendente"),
      chave_acesso: chave || null,
      protocolo_autorizacao: protocolo || null,
      numero: numero || null,
      data_autorizacao: isAuthorized ? new Date().toISOString() : null,
      nuvem_fiscal_id: emitJson?.id || null,
      rejection_reason: !isAuthorized ? (emitJson?.mensagem || null) : null,
      error_payload: !isAuthorized ? (emitJson as any) : null,
    }).eq("id", pendingRow.id);

    // DANFE URL (Nuvem Fiscal expõe /nfce/{id}/pdf)
    const danfe_url = emitJson?.id
      ? `https://api.nuvemfiscal.com.br/nfce/${emitJson.id}/pdf`
      : null;

    return new Response(JSON.stringify({
      success: isAuthorized,
      status: isAuthorized ? "autorizada" : status,
      chave_acesso: chave,
      protocolo,
      numero,
      danfe_url,
      emission_id: pendingRow.id,
      motivo: !isAuthorized ? emitJson?.mensagem : undefined,
      raw: emitJson,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("emit-nfce error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
